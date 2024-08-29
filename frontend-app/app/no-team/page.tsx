export default function NoTeamPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">No Team Found</h1>
        <p className="mt-4 text-gray-600">
          Please wait for your account to be assigned to a team.
        </p>
        <p className="mt-4 text-gray-600">
          Reach out to <strong>Jayson Binion</strong> or{" "}
          <strong>Myles Matz</strong>.
        </p>
      </div>
    </div>
  );
}
