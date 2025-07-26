import React, { useEffect, useState } from 'react';

const Members = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Retrieve data from session storage
    const storedMembers = sessionStorage.getItem('allMembers');
    if (storedMembers) {
      try {
        setMembers(JSON.parse(storedMembers));
      } catch (error) {
        console.error('Error parsing allMembers from session storage:', error);
        setMembers([]);
      }
    }
  }, []); // Empty dependency array means this effect runs once after the initial render

  return (
    <div className="container mx-auto p-4 font-sans max-w-6xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Esteemed Members</h2>
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-center transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {member.img ? (
                  <img
                    src={member.img}
                    alt={`${member.name}'s profile`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No Image</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2 truncate">
                {member.name} {member.last_name}
              </h3>
              <p className="text-gray-700 text-base mb-1">
                <strong className="font-medium text-gray-800">Roll No:</strong> {member.roll_no}
              </p>
              {member.email && (
                <p className="text-gray-700 text-sm mb-1 truncate">
                  <strong className="font-medium text-gray-800">Email:</strong> {member.email}
                </p>
              )}
              {member.phone_no && (
                <p className="text-gray-700 text-sm mb-1">
                  <strong className="font-medium text-gray-800">Phone:</strong> {member.phone_no}
                </p>
              )}
              {member.address && (
                <p className="text-gray-700 text-sm leading-tight">
                  <strong className="font-medium text-gray-800">Address:</strong> {member.address}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg">No members found in session storage.</p>
      )}
    </div>
  );
};

export default Members;