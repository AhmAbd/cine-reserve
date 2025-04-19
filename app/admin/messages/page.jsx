// app/messages/page.jsx
import MessagesList from "../../../components/admin/MessagesList"; // Bileşenin doğru yolu

export default function MessagesPage() {
  return (
    <div className="messages-page">
      <MessagesList />
    </div>
  );
}
