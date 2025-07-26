import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [member, setMember] = useState(null);

  useEffect(() => {
    const storedMember = localStorage.getItem('loggedInMember');
    if (storedMember) {
      setMember(JSON.parse(storedMember));
    }
  }, []);

  if (!member) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-10 border border-gray-200">
      <div className="flex flex-col items-center mb-6">
        {/* Blank Profile Image */}
        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xl font-semibold mb-4">
          IMG
        </div>

        {/* Roll Number */}
        <p className="text-sm text-gray-500">Roll No: <span className="text-gray-800 font-medium">{member.roll_no}</span></p>
      </div>

      {/* User Details */}
      <div className="space-y-4">
        <div>
          <span className="font-medium text-gray-700">Name:</span>
          <p className="text-gray-900">{member.name} {member.last_name}</p>
        </div>

        <div>
          <span className="font-medium text-gray-700">Email:</span>
          <p className="text-gray-900">{member.email}</p>
        </div>

        <div>
          <span className="font-medium text-gray-700">Phone:</span>
          <p className="text-gray-900">{member.phone_no}</p>
        </div>

        <div>
          <span className="font-medium text-gray-700">Address:</span>
          <p className="text-gray-900">{member.address}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
