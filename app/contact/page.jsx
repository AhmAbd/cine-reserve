import dynamic from 'next/dynamic';

const Contact = dynamic(() => import('../../components/Contact'), { ssr: false });

const ContactPage = () => {
  return <Contact />;
};

export default ContactPage;