import React, { useState } from "react";

const EmailInput = ({ emails, setEmails }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Email validation function using regex
  const validateEmail = (email) => {
    // Simple regex to validate email format
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleAddEmail = () => {
    // Check if the email is valid
    if (email && validateEmail(email)) {
      if (!emails.includes(email)) {
        setEmails([...emails, email]);
        setEmail("");  // Clear the input after adding the email
        setError("");  // Clear any existing error
      } else {
        setError("Email already added.");
      }
    } else {
      setError("Please enter a valid email address.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddEmail();
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter team member's email"
        className="border p-2 mb-4 w-full rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        type="button"
        onClick={handleAddEmail}
        className="bg-[#FFCA28] cursor-pointer text-black px-4 py-2 rounded mt-2"
      >
        Add Email
      </button>

      {/* Display error message if email is invalid */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default EmailInput;
