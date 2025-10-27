import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

function UploadImage() {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);
  const maxUploadSizeInBytes = 10 * 1024 * 1024; // 10MB
  const maxUploadsPerDay = 20;
  const bucketName = "images"; // pastikan bucket ini sudah kamu buat di Supabase Storage

  useEffect(() => {
    listImages();
  }, []);

  // 🔹 Ambil semua gambar dari bucket Supabase
  const listImages = async () => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) throw error;

      const urls = data.map((file) => {
        const { data: publicUrl } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);
        return publicUrl.publicUrl;
      });

      setImageList(urls);
    } catch (err) {
      console.error("Gagal memuat gambar:", err.message);
    }
  };

  // 🔹 Upload gambar ke Supabase Storage
  const uploadImage = async () => {
    if (!imageUpload) return;

    const uploadedImagesCount = parseInt(localStorage.getItem("uploadedImagesCount")) || 0;
    const lastUploadDate = localStorage.getItem("lastUploadDate");
    const today = new Date().toDateString();

    if (lastUploadDate && lastUploadDate !== today) {
      // reset harian
      localStorage.setItem("uploadedImagesCount", 0);
      localStorage.setItem("lastUploadDate", today);
    }

    if (uploadedImagesCount >= maxUploadsPerDay) {
      Swal.fire({
        icon: "error",
        title: "Limit Reached",
        text: "You have reached the maximum uploads for today (20).",
      });
      return;
    }

    if (imageUpload.size > maxUploadSizeInBytes) {
      Swal.fire({
        icon: "error",
        title: "File too large",
        text: "Maximum allowed size is 10MB.",
      });
      return;
    }

    try {
      const fileExt = imageUpload.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imageUpload);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      setImageList((prev) => [data.publicUrl, ...prev]);

      // Simpan jumlah upload harian
      localStorage.setItem("uploadedImagesCount", uploadedImagesCount + 1);
      localStorage.setItem("lastUploadDate", today);

      Swal.fire({
        icon: "success",
        title: "Upload Berhasil",
        text: "Gambar kamu berhasil diupload!",
      });

      setImageUpload(null);
    } catch (err) {
      console.error("Upload gagal:", err.message);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message,
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white">Upload Your Classroom Memories</h1>
      </div>

      <div className="mx-auto p-4">
        <form>
          <div className="mb-4">
            <input type="file" id="imageUpload" className="hidden" onChange={(e) => setImageUpload(e.target.files[0])} />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer border-dashed border-2 border-gray-400 rounded-lg p-4 w-56 flex items-center justify-center"
            >
              {imageUpload ? (
                <img
                  src={URL.createObjectURL(imageUpload)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center px-5 py-8 text-white opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-10 w-10 mx-auto mb-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Click to select an image
                </div>
              )}
            </label>
          </div>
        </form>
      </div>

      <button
        type="button"
        onClick={uploadImage}
        className="py-2.5 w-[60%] text-sm font-medium bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100"
      >
        UPLOAD
      </button>

      {/* Daftar Gambar */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {imageList.map((url, i) => (
          <img key={i} src={url} alt={`uploaded-${i}`} className="rounded-lg shadow-md" />
        ))}
      </div>
    </div>
  );
}

export default UploadImage;
