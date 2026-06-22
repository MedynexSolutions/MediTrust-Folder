import RoleSetupPage from '@/components/setup/RoleSetupPage';

export default function PatientSetup() {
  return (
    <RoleSetupPage
      role="patient"
      title="Patient setup"
      description="Create your patient profile in MediTrust, then access your dashboard."
    />
  );
}
