import * as React from "react";
import { notFound } from "next/navigation";
import { getStaffPatientById } from "@/lib/services/petugas";
import { getPatientChangeLogs } from "@/lib/services/pasien";
import { UpdatePasienForm } from "@/components/petugas/update-pasien-form";

interface UpdatePasienPageProps {
  params: Promise<{
    patientId: string;
  }>;
}

export default async function UpdatePasienPage({ params }: UpdatePasienPageProps) {
  const { patientId } = await params;
  const [patient, changeLogs] = await Promise.all([
    getStaffPatientById(patientId),
    getPatientChangeLogs(patientId),
  ]);

  if (!patient) {
    notFound();
  }

  return <UpdatePasienForm patient={patient} initialLogs={changeLogs} />;
}
