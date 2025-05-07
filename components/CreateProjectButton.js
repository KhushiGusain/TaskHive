"use client";
import React, { useState } from 'react';
import Modal from './Modal';

const CreateProjectButton = ({ fetchProjects }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-40 py-2.5 cursor-pointer text-lg font-semibold text-[#212121] bg-[#FFCA28] rounded-lg hover:bg-[#f4b400] transition-all duration-200"
      >
        Create Project
      </button>

      {showModal && (
        <Modal setShowModal={setShowModal} fetchProjects={fetchProjects} />
      )}
    </>
  );
};

export default CreateProjectButton; 