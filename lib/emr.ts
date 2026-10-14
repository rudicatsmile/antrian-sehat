import { createServiceRoleClient } from "./supabase/service-role";

export interface FhirPatientResource {
  resourceType: "Patient";
  id?: string;
  identifier: {
    system: string;
    value: string;
  }[];
  name: {
    use: string;
    text: string;
  }[];
  telecom: {
    system: string;
    value: string;
    use: string;
  }[];
  gender: "male" | "female" | "other";
  birthDate?: string;
  address?: {
    text: string;
  }[];
}

export interface FhirEncounterResource {
  resourceType: "Encounter";
  id?: string;
  status: "planned" | "arrived" | "triaged" | "in-progress" | "finished" | "cancelled";
  class: {
    system: string;
    code: "AMB" | "EMER" | "IMP";
    display: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  serviceProvider?: {
    display: string;
  };
  period?: {
    start: string;
    end?: string;
  };
}

export interface EmrSyncResult {
  success: boolean;
  emrPatientId?: string;
  emrEncounterId?: string;
  error?: string;
}

/**
 * Synchronizes Patient demographic data to Hospital EMR via standard FHIR-lite Patient resource
 */
export async function syncPatientToEmr(patient: {
  id: string;
  nik: string;
  namaLengkap: string;
  noRm: string;
  noWhatsapp: string;
  tanggalLahir?: string;
  jenisKelamin?: "L" | "P";
  alamat?: string;
}): Promise<EmrSyncResult> {
  const isEnabled = process.env.EMR_SYNC_ENABLED === "true";
  const baseUrl = process.env.EMR_FHIR_BASE_URL;
  const apiKey = process.env.EMR_API_KEY;

  if (!isEnabled || !baseUrl || baseUrl.includes("example.go.id")) {
    // EMR Sync disabled or in mockup mode
    return {
      success: true,
      emrPatientId: `EMR-SIM-${patient.noRm}`,
    };
  }

  const fhirPatient: FhirPatientResource = {
    resourceType: "Patient",
    identifier: [
      {
        system: "https://fhir.kemkes.go.id/id/nik",
        value: patient.nik,
      },
      {
        system: "https://antreansehat.rsud.go.id/id/no-rm",
        value: patient.noRm,
      },
    ],
    name: [
      {
        use: "official",
        text: patient.namaLengkap,
      },
    ],
    telecom: [
      {
        system: "phone",
        value: patient.noWhatsapp,
        use: "mobile",
      },
    ],
    gender: patient.jenisKelamin === "L" ? "male" : "female",
    birthDate: patient.tanggalLahir || undefined,
    address: patient.alamat ? [{ text: patient.alamat }] : undefined,
  };

  const serviceSupabase = createServiceRoleClient();

  try {
    const res = await fetch(`${baseUrl}/Patient`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(fhirPatient),
    });

    const data = await res.json();

    if (!res.ok) {
      await serviceSupabase.from("emr_sync_logs").insert({
        endpoint: `${baseUrl}/Patient`,
        status: "gagal",
        payload: fhirPatient,
        response_code: res.status,
        error_message: JSON.stringify(data),
      });

      return {
        success: false,
        error: `EMR FHIR Error: ${res.status}`,
      };
    }

    const emrId = data.id || `EMR-${patient.noRm}`;

    // Update profiles with emr_patient_id
    await serviceSupabase
      .from("profiles")
      .update({ emr_patient_id: emrId })
      .eq("id", patient.id);

    // Log success
    await serviceSupabase.from("emr_sync_logs").insert({
      endpoint: `${baseUrl}/Patient`,
      status: "sukses",
      payload: fhirPatient,
      response_code: res.status,
    });

    return {
      success: true,
      emrPatientId: emrId,
    };
  } catch (err: any) {
    await serviceSupabase.from("emr_sync_logs").insert({
      endpoint: `${baseUrl}/Patient`,
      status: "gagal",
      payload: fhirPatient,
      error_message: err.message,
    });

    return {
      success: false,
      error: err.message || "Gagal menghubungkan ke server EMR FHIR.",
    };
  }
}

/**
 * Synchronizes Visit Encounter (Ticket arrival, service, completion) to EMR
 */
export async function syncEncounterToEmr(encounter: {
  ticketId: string;
  emrPatientId: string;
  patientName: string;
  unitNama: string;
  status: "menunggu" | "dipanggil" | "dilayani" | "selesai" | "batal";
  triageLevel?: "merah" | "kuning" | "hijau";
  startTime: string;
  endTime?: string;
}): Promise<EmrSyncResult> {
  const isEnabled = process.env.EMR_SYNC_ENABLED === "true";
  const baseUrl = process.env.EMR_FHIR_BASE_URL;
  const apiKey = process.env.EMR_API_KEY;

  if (!isEnabled || !baseUrl || baseUrl.includes("example.go.id")) {
    return {
      success: true,
      emrEncounterId: `ENC-SIM-${encounter.ticketId.slice(0, 8)}`,
    };
  }

  const statusMap: Record<string, FhirEncounterResource["status"]> = {
    menunggu: "arrived",
    dipanggil: "in-progress",
    dilayani: "in-progress",
    selesai: "finished",
    batal: "cancelled",
  };

  const fhirEncounter: FhirEncounterResource = {
    resourceType: "Encounter",
    status: statusMap[encounter.status] || "arrived",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: encounter.triageLevel ? "EMER" : "AMB",
      display: encounter.triageLevel ? "Emergency" : "Ambulatory Rawat Jalan",
    },
    subject: {
      reference: `Patient/${encounter.emrPatientId}`,
      display: encounter.patientName,
    },
    serviceProvider: {
      display: encounter.unitNama,
    },
    period: {
      start: encounter.startTime,
      end: encounter.endTime,
    },
  };

  const serviceSupabase = createServiceRoleClient();

  try {
    const res = await fetch(`${baseUrl}/Encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(fhirEncounter),
    });

    const data = await res.json();

    await serviceSupabase.from("emr_sync_logs").insert({
      endpoint: `${baseUrl}/Encounter`,
      status: res.ok ? "sukses" : "gagal",
      payload: fhirEncounter,
      response_code: res.status,
      error_message: res.ok ? null : JSON.stringify(data),
    });

    return {
      success: res.ok,
      emrEncounterId: data.id || `ENC-${encounter.ticketId.slice(0, 8)}`,
    };
  } catch (err: any) {
    await serviceSupabase.from("emr_sync_logs").insert({
      endpoint: `${baseUrl}/Encounter`,
      status: "gagal",
      payload: fhirEncounter,
      error_message: err.message,
    });

    return {
      success: false,
      error: err.message,
    };
  }
}
