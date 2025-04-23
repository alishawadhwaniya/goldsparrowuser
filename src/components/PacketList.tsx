import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, CheckCircle, Clock, Eye, FileText, Download, XCircle } from "lucide-react";
import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/api/client';
import { ApiResponse, API_BASE_URL } from "@/api/config";
import axios from 'axios';
import debounce from 'lodash/debounce';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginatedResponse } from "@/api/types";

interface PacketListProps {
  viewMode: string;
  searchTerm: string;
  showHistory?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}


interface GoldPacket extends Packet {
  invoice_file_path?: string;
}

interface Packet {
  id: string;
  gross_weight: string;
  net_weight: string;
  bank_name: string;
  branch_name: string;
  loan_account_number: string;
  submitted_by: string;
  status: string;
  lifted_status: string | null;
  invoice_status: boolean;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  submitter_name: string;
  images?: string[];
}

interface UploadResponse {
  id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

const PacketList = ({ viewMode, searchTerm, showHistory = false, dateFrom, dateTo }: PacketListProps) => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // You can adjust this value
  const { toast } = useToast();
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [liftedStatus, setLiftedStatus] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchPackets();
  }, [currentPage, viewMode, debouncedSearchTerm, dateFrom, dateTo, showHistory]);

  const fetchPackets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (debouncedSearchTerm) {
        queryParams.append('loanAccountNumber', debouncedSearchTerm);
      }

      if (dateFrom) {
        queryParams.append('dateFrom', dateFrom.toISOString());
      }

      if (dateTo) {
        queryParams.append('dateTo', dateTo.toISOString());
      }

      // Add view mode filter if not "all"
      if (viewMode !== "all") {
        queryParams.append('status', viewMode);
      }

      // Add pagination parameters
      queryParams.append('page', currentPage.toString());
      queryParams.append('per_page', itemsPerPage.toString());

      const data = await apiClient.get<Packet[]>(`/packets?${queryParams.toString()}`);

      console.log("data", data);
      if (data.success) {
        setPackets(data.data);
        setTotalPages(data.meta.total_pages);
        setTotalItems(data.meta.total);
      } else {
        throw new Error(data.message || 'Failed to fetch packets');
      }
    } catch (error) {
      console.error('Error fetching packets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packets. Please try again.",
        variant: "destructive",
      });
      setPackets([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPacket = (packet: Packet) => {
    setSelectedPacket(packet);
    setLiftedStatus(packet.lifted_status || "");
    setInvoiceStatus(packet.invoice_status ? "yes" : "no");
    setInvoiceFile(null);
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPacket) return;

    setUpdating(true);
    try {
      // Validate
      if (liftedStatus && (!invoiceStatus || (invoiceStatus === "yes" && !invoiceFile && !selectedPacket.invoice_status))) {
        toast({
          title: "Missing information",
          description: "Please select invoice status and upload an invoice if required.",
          variant: "destructive",
        });
        return;
      }

      // Update lifted status if changed
      if (liftedStatus && liftedStatus !== selectedPacket.lifted_status) {
        const liftedResponse = await apiClient.patch(`/packets/${selectedPacket.id}/lifted`, {
          liftedStatus: liftedStatus
        });

        if (!liftedResponse.success) {
          throw new Error(liftedResponse.message || 'Failed to update lifted status');
        }
      }

      // Update invoice status if changed
      if (invoiceStatus && invoiceStatus !== (selectedPacket.invoice_status ? "yes" : "no")) {
        let invoiceFilePath = null;

        // If there's a file and invoice status is yes, upload the file first
        if (invoiceFile && invoiceStatus === "yes") {
          const formData = new FormData();
          formData.append('file', invoiceFile);

          console.log("invoiceFile", invoiceFile);

          const uploadResponse = await apiClient.postFormData<UploadResponse>('/uploads', formData);

          if (!uploadResponse.success) {
            toast({
              title: "Error",
              description: "Failed to upload invoice file. Please try again.",
              variant: "destructive",
            });
            return;
          }

          console.log("uploadResponse", uploadResponse);
          invoiceFilePath = uploadResponse.data?.id;
        }

        // Update invoice status with the file path if available
        const invoiceResponse = await apiClient.patch(`/packets/${selectedPacket.id}/invoice`, {
          invoiceStatus: invoiceStatus === "yes" ? true : false,
          invoiceFilePath: invoiceFilePath || ""
        });

        if (!invoiceResponse.success) {
          toast({
            title: "Error",
            description: "Failed to update invoice status. Please try again.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Status updated",
        description: `Packet ${selectedPacket.loan_account_number} status has been updated successfully.`,
      });
      fetchPackets(); // Refresh the list
      setSelectedPacket(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update packet status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async (packetId: string) => {
    try {
      const packetResponse = await apiClient.get<GoldPacket>(`/packets/${packetId}`);

      if (!packetResponse.success) {
        throw new Error(packetResponse.message || 'Failed to get packet details');
      }

      const invoiceFileId = packetResponse.data?.invoice_file_path;

      if (!invoiceFileId) {
        toast({
          title: "Error",
          description: "No invoice file found",
          variant: "destructive",
        });
        return
      }

      // Use axios directly for blob download
      const response = await axios.get(`${API_BASE_URL}/uploads/${invoiceFileId}/download`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: '*/*'
        }
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const contentType = response.headers['content-type'] || 'application/pdf';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${packetId}.${contentType.split('/')[1] || 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLiftedBadge = (lifted: string | null) => {
    if (!lifted) return null;

    switch (lifted) {
      case "lifted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">Lifted</Badge>;
      case "hold":
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100">On Hold</Badge>;
      default:
        return null;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (totalItems === 0) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold">No packets found</h3>
        <p className="text-gray-500 mt-2">
          {searchTerm
            ? `No packets match your search for "${searchTerm}"`
            : `No ${viewMode !== "all" ? viewMode : ""} packets available`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col">
      <div className="rounded-md border overflow-auto max-h-[calc(100vh-300px)] min-h-[200px]">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>LAN</TableHead>
              <TableHead>Weight (G/N)</TableHead>
              <TableHead className="hidden md:table-cell">Bank & Branch</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packets.map((packet) => (
              <TableRow key={packet.id}>
                <TableCell className="font-medium">{packet.loan_account_number}</TableCell>
                <TableCell>
                  {packet.gross_weight}g / {packet.net_weight}g
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>{packet.bank_name}</div>
                  <div className="text-xs text-muted-foreground">{packet.branch_name}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(packet.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    {getStatusBadge(packet.status)}
                    {packet.status === "approved" && getLiftedBadge(packet.lifted_status)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => handleViewPacket(packet)}>
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Gold Packet Details</DialogTitle>
                        <DialogDescription>
                          LAN: {packet.loan_account_number}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="overflow-y-auto flex-1 pr-1.5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Basic Information</h4>
                            <dl className="space-y-2">
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Gross Weight:</dt>
                                <dd className="text-sm font-semibold">{packet.gross_weight}g</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Net Weight:</dt>
                                <dd className="text-sm font-semibold">{packet.net_weight}g</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Bank:</dt>
                                <dd className="text-sm">{packet.bank_name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Branch:</dt>
                                <dd className="text-sm">{packet.branch_name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Submitted By:</dt>
                                <dd className="text-sm">{packet.submitter_name}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Submitted Date:</dt>
                                <dd className="text-sm">{new Date(packet.created_at).toLocaleDateString()}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-sm font-medium text-gray-500">Status:</dt>
                                <dd>{getStatusBadge(packet.status)}</dd>
                              </div>
                              {packet.lifted_status && (
                                <div className="flex justify-between">
                                  <dt className="text-sm font-medium text-gray-500">Lifted Status:</dt>
                                  <dd>{getLiftedBadge(packet.lifted_status)}</dd>
                                </div>
                              )}
                              {packet.invoice_status !== null && (
                                <div className="flex justify-between items-center">
                                  <dt className="text-sm font-medium text-gray-500">Invoice:</dt>
                                  <dd className="text-sm flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {packet.invoice_status ? (
                                      <div className="flex items-center">
                                        <span className="mr-2">Available</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadInvoice(packet.id);
                                          }}
                                          className="p-1 h-6"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : "Not Available"}
                                  </dd>
                                </div>
                              )}
                              {packet.rejection_reason && (
                                <div className="flex justify-between">
                                  <dt className="text-sm font-medium text-gray-500">Rejection Reason:</dt>
                                  <dd className="text-sm text-red-500">{packet.rejection_reason}</dd>
                                </div>
                              )}
                            </dl>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold mb-2">Images</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {packets.find(p => p.id === packet.id)?.images?.map((image, index) => (
                                <div key={index} className="border rounded-md overflow-hidden">
                                  <img
                                    src={image}
                                    alt={`Gold packet ${index + 1}`}
                                    className="w-full h-24 object-cover"
                                  />
                                </div>
                              ))}
                            </div>

                            {packet.status === "approved" && !showHistory && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Update Status</h4>
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <Label htmlFor="lifted-status">Lifted Status</Label>
                                    <Select
                                      value={liftedStatus}
                                      onValueChange={setLiftedStatus}
                                    >
                                      <SelectTrigger id="lifted-status">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="lifted">Lifted</SelectItem>
                                        <SelectItem value="hold">Hold</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {liftedStatus && (
                                    <div className="space-y-1">
                                      <Label htmlFor="invoice-status">Invoice Status</Label>
                                      <Select
                                        value={invoiceStatus}
                                        onValueChange={setInvoiceStatus}
                                      >
                                        <SelectTrigger id="invoice-status">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="yes">Yes</SelectItem>
                                          <SelectItem value="no">No</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  {liftedStatus && invoiceStatus === "yes" && !packet.invoice_status && (
                                    <div className="space-y-1">
                                      <Label htmlFor="invoice-upload">Upload Invoice</Label>
                                      <Input
                                        id="invoice-upload"
                                        type="file"
                                        onChange={handleInvoiceChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="mt-4 pt-2 border-t">
                        {packet.status === "approved" && !showHistory && (
                          <Button
                            onClick={handleUpdateStatus}
                            disabled={updating || (!liftedStatus)}
                            className="gold-gradient hover:opacity-90"
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-4 space-y-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-sm text-gray-500 text-center">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </div>
        </div>
      )}
    </div>
  );
};

export default PacketList;
