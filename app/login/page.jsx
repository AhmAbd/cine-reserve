import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import LoginForm from '../../components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
