import UploadForm from "@/components/UploadForm";

const NewBookPage = () => {
  return (
    <main className="wrapper container !min-h-0 !pb-4">
      <div className="mx-auto w-full max-w-180">
        <section className="flex flex-col items-center gap-5 text-center">
          <h1 className="page-title-xl">Add a New Book</h1>
          <p className="subtitle">
            Upload a PDF to generate your interactive interview
          </p>
        </section>
        <UploadForm />
      </div>
    </main>
  );
};

export default NewBookPage;