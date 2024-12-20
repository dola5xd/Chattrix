"use client";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

function UploadComponent({
  avatarFile,
  setAvatarFile,
}: {
  avatarFile: FileList | null;
  setAvatarFile: Dispatch<SetStateAction<FileList | null>>;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files || null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file?.[0]);
    } else {
      setPreviewUrl(undefined);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        {" "}
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {!previewUrl ? (
            <>
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="relative w-16 h-16">
                <Image
                  src={previewUrl}
                  alt="Avatar Preview"
                  fill
                  className="object-cover rounded-full"
                />
              </span>
              <span className="text-xs font-bold text-Purple ">
                {avatarFile?.[0].name}
              </span>
            </div>
          )}
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

export default UploadComponent;
