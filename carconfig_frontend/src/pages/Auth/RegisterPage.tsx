import RegisterForm from "@/components/shadcn-space/blocks/register-01/register";

/** Stesso grigio chiaro dello sfondo delle foto prodotto */
const AUTH_PANEL_BG = "#f0f0f0";

const RegisterPage = () => {
  return (
    <div
      className={`grid min-h-screen grid-cols-1 bg-[var(--auth-panel-bg)] lg:grid-cols-2 [--auth-panel-bg:${AUTH_PANEL_BG}]`}
    >
      {/* Sinistra — immagine intera */}
      <div className="hidden min-h-screen flex-col lg:flex">
        <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
          <img
            src="https://www.service-lab.com/wp-content/uploads/2025/02/configuratore-auto-1200x900.jpg"
            alt="Car Config"
            className="h-auto max-h-[min(85vh,900px)] w-full max-w-full object-contain"
          />
        </div>
        <div className="px-12 pb-12 pt-0">
          <h1 className="text-3xl font-semibold text-foreground">Car Config</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Gestisci configurazioni, utenti e automazioni in modo semplice e
            veloce.
          </p>
        </div>
      </div>

      {/* Destra — registrazione */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
