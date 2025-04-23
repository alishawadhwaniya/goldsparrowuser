import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, X } from "lucide-react";
import { apiClient } from '@/api/client';

interface UploadResponse {
  id: string;
  url: string;
}

const banks = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Axis Bank",
  "Canara Bank",
];

const branches = [
  "Mumbai Main Branch",
  "Delhi CP Branch",
  "Bangalore MG Road",
  "Chennai Mount Road",
  "Kolkata Park Street",
  "Hyderabad Banjara Hills",
  "Pune FC Road",
];


interface ImagePreview {
  id: number;
  preview: string;
  file: File;
  uploadId?: string;
}

const PacketForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [formData, setFormData] = useState({
    grossWeight: "22",
    netWeight: "22",
    branchName: "Chennai Mount Road",
    bankName: "Bank of Baroda",
    loanAccountNumber: "44839534593845",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (images.length >= 4) {
        toast({
          title: "Maximum limit reached",
          description: "You can only upload up to 4 images.",
          variant: "destructive",
        });
        return;
      }

      const file = e.target.files[0];
      const reader = new FileReader();

      try {
        setIsUploading(true);

        // Create preview
        reader.onload = () => {
          setImages(prevImages => [
            ...prevImages,
            {
              id: Date.now(),
              preview: reader.result as string,
              file: file,
            },
          ]);
        };
        reader.readAsDataURL(file);

        // Upload file immediately
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.postFormData<UploadResponse>('/uploads', formData);

        // Update the image with the upload ID
        setImages(prevImages =>
          prevImages.map(img =>
            img.file === file
              ? { ...img, uploadId: response.data.id }
              : img
          )
        );

      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        setImages(prevImages => prevImages.filter(img => img.file !== file));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = async (imageToRemove: ImagePreview) => {
    setImages(images.filter(image => image.id !== imageToRemove.id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!formData.grossWeight) {
      toast({
        title: "Incomplete form",
        description: "Please enter gross weight",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.netWeight) {
      toast({
        title: "Incomplete form",
        description: "Please enter net weight",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.branchName) {
      toast({
        title: "Incomplete form",
        description: "Please enter branch name",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.bankName) {
      toast({
        title: "Incomplete form",
        description: "Please enter bank name",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.loanAccountNumber) {
      toast({
        title: "Incomplete form",
        description: "Please enter loan account number",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Incomplete form",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const pendingUploads = images.some(img => !img.uploadId);

    if (pendingUploads) {
      toast({
        title: "Images uploading",
        description: "Please wait for all images to finish uploading.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.post('/packets', {
        grossWeight: parseFloat(formData.grossWeight),
        netWeight: parseFloat(formData.netWeight),
        branchName: formData.branchName,
        bankName: formData.bankName,
        loanAccountNumber: formData.loanAccountNumber,
        images: images.map(img => img.uploadId as string),
      });

      if (response.success) {

        toast({
          title: "Success",
          description: "Packet submitted successfully",
        });

        setFormData({
          grossWeight: "",
          netWeight: "",
          branchName: "",
          bankName: "",
          loanAccountNumber: "",
        });

        setImages([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit packet. Please try again.",
        variant: "destructive",
      });
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Submit Gold Packet</CardTitle>
        <CardDescription>Enter the details of the gold packet for auction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grossWeight">Gross Weight (GW) in grams</Label>
              <Input
                id="grossWeight"
                name="grossWeight"
                placeholder="Enter gross weight"
                value={formData.grossWeight}
                onChange={handleChange}
                type="number"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netWeight">Net Weight (NW) in grams</Label>
              <Input
                id="netWeight"
                name="netWeight"
                placeholder="Enter net weight"
                value={formData.netWeight}
                onChange={handleChange}
                type="number"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Select
                value={formData.bankName}
                onValueChange={(value) => handleSelectChange("bankName", value)}
              >
                <SelectTrigger id="bankName">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Select
                value={formData.branchName}
                onValueChange={(value) => handleSelectChange("branchName", value)}
              >
                <SelectTrigger id="branchName">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanAccountNumber">Loan Account Number (LAN)</Label>
              <Input
                id="loanAccountNumber"
                name="loanAccountNumber"
                placeholder="Enter loan account number"
                value={formData.loanAccountNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Upload Images (max 4)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative border rounded-md overflow-hidden h-32"
                >
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {image.uploadId ? (
                    <div className="absolute top-1 left-1 bg-green-500/50 text-white p-1 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <div className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-32 cursor-pointer hover:border-primary/50 transition-colors">
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Add Image</span>
                      </>
                    )}
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </Label>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Please upload clear images of the gold packet from multiple angles.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="gold-gradient hover:opacity-90 transition-opacity w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Packet Details"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PacketForm;
