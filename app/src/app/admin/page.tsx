import CSVUpload from "@/components/file/csv_upload";

const AdminPage = () => {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <CSVUpload />
    </main>
  );
};

export default AdminPage;
