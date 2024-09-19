"use client";

import { useState, useCallback } from "react";
import { Upload, File, AlertCircle, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormSuccess } from "../form/form-success";

export default function ExcelUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileType === "xlsx" || fileType === "xls") {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please upload only Excel files (.xlsx or .xls)");
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files ? e.target.files[0] : null;
      handleFile(selectedFile);
    },
    [handleFile],
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your Excel file here, or
          </p>
          <input
            type="file"
            onChange={handleFileInput}
            accept=".xlsx,.xls"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="mt-2">
              Select File
            </Button>
          </label>
        </div>
        {/* {file && ( */}
        {/*   <FormSuccess className="mt-4" message={"File selected: " file.name}> */}
        {/*     <File className="h-4 w-4" /> */}
        {/*     <AlertDescription>File selected: {file.name}</AlertDescription> */}
        {/*   </AlertCircleIcon> */}
        {/* )} */}
        {/* {error && ( */}
        {/*   <AlertCircleIcon variant="destructive" className="mt-4"> */}
        {/*     <AlertCircle className="h-4 w-4" /> */}
        {/*     <AlertDescription>{error}</AlertDescription> */}
        {/*   </AlertCircleIcon> */}
        {/* )} */}
      </CardContent>
    </Card>
  );
}
