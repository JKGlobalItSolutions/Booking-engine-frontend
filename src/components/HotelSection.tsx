import React from "react";

const HotelMap: React.FC = () => {
  return (
    <div className="w-full h-[500px] max-w-6xl mx-auto p-4">
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.940250699584!2d79.07131131428626!3d12.280489491324615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52f545f23f3e7d%3A0x2ad7f620e3b5ac3d!2sTiruvannamalai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1696930926263!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default HotelMap;
