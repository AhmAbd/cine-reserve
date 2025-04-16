import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100 px-4">
      <div className="w-full max-w-2xl p-8 bg-black-100 rounded-2xl shadow-md">
        {/* <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Üye Ol</h1> */}
        <RegisterForm />
      </div>
    </div>
  );
}
