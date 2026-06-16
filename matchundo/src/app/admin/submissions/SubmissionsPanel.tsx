"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  approveScreeningAction, 
  rejectScreeningAction, 
  deleteScreeningAction, 
  updateScreeningAction 
} from "@/app/actions";
import { trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  Edit2, 
  Trash2, 
  Calendar, 
  Loader2, 
  AlertTriangle, 
  User, 
  Info,
  Map as MapIcon
} from "lucide-react";
import { Screening } from "@/lib/db";

interface SubmissionsPanelProps {
  initialScreenings: Screening[];
  initialTab?: string;
}

function formatScreeningDateTime(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return "TBD";
  }
}

export default function SubmissionsPanel({ initialScreenings, initialTab = "pending" }: SubmissionsPanelProps) {
  const router = useRouter();

  // Track page view
  useEffect(() => {
    trackPageView("/admin/submissions");
  }, []);

  const screenings = initialScreenings;
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">(
    (initialTab === "approved" || initialTab === "rejected" || initialTab === "pending"
      ? initialTab
      : "pending") as "pending" | "approved" | "rejected"
  );

  // Sync state if initialTab changes on server
  useEffect(() => {
    if (initialTab === "approved" || initialTab === "rejected" || initialTab === "pending") {
      setActiveTab(initialTab as "pending" | "approved" | "rejected");
    }
  }, [initialTab]);

  const handleTabChange = (tab: "pending" | "approved" | "rejected") => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  
  // Form values
  const [matchName, setMatchName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [screeningDatetime, setScreeningDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");

  // Confirmation dialog states
  const [confirmDeleteScreening, setConfirmDeleteScreening] = useState<Screening | null>(null);
  const [confirmRejectScreening, setConfirmRejectScreening] = useState<Screening | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Interaction UI states
  const [isSaving, setIsSaving] = useState(false);
  const [isActionPending, setIsActionPending] = useState<string | null>(null); // holds id of actioning screening
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});



  // Toast trigger helper
  const showToast = (text: string, type: "success" | "error") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Filter screenings based on active tab
  const filteredScreenings = screenings.filter(
    (s) => (s.status || "approved").toLowerCase() === activeTab
  );

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!matchName.trim()) errors.matchName = "Match name is required";
    if (!venueName.trim()) errors.venueName = "Venue name is required";
    if (!city.trim()) errors.city = "City is required";
    if (!address.trim()) errors.address = "Address is required";
    if (!screeningDatetime) {
      errors.screeningDatetime = "Date and time is required";
    } else if (new Date(screeningDatetime) < new Date()) {
      errors.screeningDatetime = "Screening date must be in the future.";
    }
    
    if (googleMapsLink.trim()) {
      if (!googleMapsLink.startsWith("http://") && !googleMapsLink.startsWith("https://")) {
        errors.googleMapsLink = "Please enter a valid URL (starting with http:// or https://)";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 1. Approve Screening Action
  const handleApprove = async (id: string) => {
    setIsActionPending(id);
    try {
      const response = await approveScreeningAction(id);
      if (response.success) {
        showToast("Screening approved successfully", "success");
        router.refresh();
      } else {
        showToast(response.error || "Failed to approve screening", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Internal server error", "error");
    } finally {
      setIsActionPending(null);
    }
  };

  // 2. Reject Screening Confirmation trigger
  const triggerReject = (screening: Screening) => {
    setConfirmRejectScreening(screening);
    setRejectionNotes("");
  };

  const executeReject = async () => {
    if (!confirmRejectScreening) return;
    const id = confirmRejectScreening.id;
    setIsActionPending(id);
    setConfirmRejectScreening(null);

    try {
      const response = await rejectScreeningAction(id, rejectionNotes.trim());
      if (response.success) {
        showToast("Screening rejected successfully", "success");
        router.refresh();
      } else {
        showToast(response.error || "Failed to reject screening", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Internal server error", "error");
    } finally {
      setIsActionPending(null);
    }
  };

  // 3. Edit Modal opener
  const openEditModal = (screening: Screening) => {
    setEditingScreening(screening);
    setMatchName(screening.match_name);
    setVenueName(screening.venue_name);
    setCity(screening.city);
    setAddress(screening.address);
    
    // Format datetime-local string (YYYY-MM-DDTHH:MM)
    try {
      const d = new Date(screening.screening_datetime);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setScreeningDatetime(localISOTime);
    } catch {
      setScreeningDatetime("");
    }
    
    setDescription(screening.description);
    setGoogleMapsLink(screening.google_maps_link);
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScreening) return;

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await updateScreeningAction(editingScreening.id, {
        match_name: matchName.trim(),
        venue_name: venueName.trim(),
        city: city.trim(),
        address: address.trim(),
        screening_datetime: screeningDatetime,
        description: description.trim(),
        google_maps_link: googleMapsLink.trim()
      });

      if (response.success) {
        showToast("Screening updated successfully", "success");
        setIsEditModalOpen(false);
        router.refresh();
      } else {
        showToast(response.error || "Failed to update screening", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Internal server error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Delete Action trigger
  const triggerDelete = (screening: Screening) => {
    setConfirmDeleteScreening(screening);
  };

  const executeDelete = async () => {
    if (!confirmDeleteScreening) return;
    const id = confirmDeleteScreening.id;
    setIsActionPending(id);
    setConfirmDeleteScreening(null);

    try {
      const response = await deleteScreeningAction(id);
      if (response.success) {
        showToast("Screening deleted successfully", "success");
        router.refresh();
      } else {
        showToast(response.error || "Failed to delete screening", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Internal server error", "error");
    } finally {
      setIsActionPending(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Moderation Dashboard
          </h1>
          <p className="text-zinc-550 text-[11px] mt-0.5">
            Approve, edit, or reject match screenings submitted by the community.
          </p>
        </div>
        <div className="text-[11px] text-zinc-500 font-semibold bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <span>Logged in as Administrator</span>
        </div>
      </div>

      <div className="flex border-b border-zinc-900 mb-6 gap-2 text-xs">
        <button
          onClick={() => handleTabChange("pending")}
          className={`pb-2.5 px-2 font-bold transition-all relative ${
            activeTab === "pending"
              ? "text-white border-b-2 border-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Pending submissions
          {screenings.filter((s) => s.status === "pending").length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-semibold">
              {screenings.filter((s) => s.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange("approved")}
          className={`pb-2.5 px-2 font-bold transition-all relative ${
            activeTab === "approved"
              ? "text-white border-b-2 border-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => handleTabChange("rejected")}
          className={`pb-2.5 px-2 font-bold transition-all relative ${
            activeTab === "rejected"
              ? "text-white border-b-2 border-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Screenings list */}
      {filteredScreenings.length > 0 ? (
        <div className="space-y-4">
          {filteredScreenings.map((screening) => (
            <Card 
              key={screening.id} 
              className={`border-zinc-900 bg-zinc-950/40 overflow-hidden relative ${
                isActionPending === screening.id ? "opacity-60" : ""
              }`}
            >
              <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-5">
                
                {/* Info area */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
                      {screening.city}
                    </span>
                    
                    {screening.status === "pending" && (
                      <span className="inline-flex items-center rounded bg-amber-950/20 border border-amber-900/10 px-2 py-0.5 text-[9px] font-semibold text-amber-500">
                        Pending Approval
                      </span>
                    )}
                    {screening.status === "rejected" && (
                      <span className="inline-flex items-center rounded bg-red-950/20 border border-red-900/10 px-2 py-0.5 text-[9px] font-semibold text-red-400">
                        Rejected
                      </span>
                    )}
                    {screening.status === "approved" && (
                      <span className="inline-flex items-center rounded bg-emerald-950/20 border border-emerald-900/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400">
                        Live / Approved
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{screening.match_name}</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-zinc-305">{screening.venue_name}</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-zinc-500">{screening.address}</span>
                    </p>
                  </div>

                  {/* Submission date times info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg text-[10px] text-zinc-500 bg-zinc-950/80 p-2.5 rounded border border-zinc-900">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-650 shrink-0" />
                      <span>Match time: <strong className="text-zinc-400">{formatScreeningDateTime(screening.screening_datetime)}</strong></span>
                    </div>
                    
                    {/* Submitter details */}
                    <div className="flex items-center gap-1.5 sm:border-l border-zinc-900 sm:pl-3">
                      <User className="h-3.5 w-3.5 text-zinc-650 shrink-0" />
                      <span className="truncate">
                        Submitter: <strong className="text-zinc-400">{screening.submitted_by_name || "Admin"}</strong>
                        {screening.submitted_by_email && (
                          <span className="text-[9px] text-zinc-600 ml-1">({screening.submitted_by_email})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {screening.description && (
                    <p className="text-[11px] text-zinc-500 leading-relaxed max-w-2xl whitespace-pre-line">
                      {screening.description}
                    </p>
                  )}

                  {/* Google maps indicator */}
                  {screening.google_maps_link && (
                    <div className="text-[10px] text-zinc-550 flex items-center gap-1">
                      <MapIcon className="h-3 w-3 text-zinc-650" />
                      <a 
                        href={screening.google_maps_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="hover:underline hover:text-zinc-350 truncate"
                      >
                        {screening.google_maps_link}
                      </a>
                    </div>
                  )}

                  {/* Review details */}
                  {screening.reviewed_at && (
                    <div className="text-[9px] text-zinc-600 border-t border-zinc-900/40 pt-2 flex items-center gap-1">
                      <span>Reviewed on {new Date(screening.reviewed_at).toLocaleDateString()} by {screening.reviewed_by}</span>
                    </div>
                  )}
                </div>

                {/* Actions area */}
                <div className="flex flex-row md:flex-col gap-1.5 self-end md:self-start justify-end shrink-0 w-full md:w-auto border-t md:border-t-0 border-zinc-900/60 pt-4 md:pt-0 mt-2 md:mt-0">
                  {screening.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(screening.id)}
                        disabled={isActionPending !== null}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-7.5 px-3 flex-1 md:flex-none"
                      >
                        {isActionPending === screening.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-white" />
                        ) : (
                          "Approve"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerReject(screening)}
                        disabled={isActionPending !== null}
                        className="border-red-950 text-red-400 hover:bg-red-950/10 text-[10px] font-bold h-7.5 px-3 flex-1 md:flex-none"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {screening.status === "rejected" && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(screening.id)}
                      disabled={isActionPending !== null}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold h-7.5 px-3 flex-1 md:flex-none"
                    >
                      Approve (Restore)
                    </Button>
                  )}

                  {screening.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerReject(screening)}
                      disabled={isActionPending !== null}
                      className="border-zinc-900 hover:bg-zinc-900 text-[10px] font-bold h-7.5 px-3 flex-1 md:flex-none"
                    >
                      Reject (Unpublish)
                    </Button>
                  )}

                  <div className="flex gap-1 flex-1 md:flex-none md:mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(screening)}
                      disabled={isActionPending !== null}
                      className="border-zinc-900 text-zinc-400 hover:text-white text-[10px] font-bold h-7.5 px-2 flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1 shrink-0" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerDelete(screening)}
                      disabled={isActionPending !== null}
                      className="border-zinc-900 text-red-500 hover:bg-red-950/20 text-[10px] font-bold h-7.5 px-2 flex-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center max-w-sm mx-auto border-zinc-900 bg-zinc-950/20 mt-6">
          <Info className="h-6 w-6 text-zinc-650 mx-auto mb-3" />
          <h3 className="text-xs font-bold text-white mb-1">No submissions found</h3>
          <p className="text-zinc-500 text-[10px] leading-relaxed">
            There are no {activeTab} match screening listings registered in the database at the moment.
          </p>
        </Card>
      )}

      {/* EDIT SUBMISSION FORM MODAL */}
      {isEditModalOpen && editingScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <Card className="border-zinc-900 bg-zinc-950 relative">
              <CardHeader className="p-5 border-b border-zinc-900">
                <CardTitle className="text-sm font-bold text-white">
                  Edit Watch Submission
                </CardTitle>
                <CardDescription className="text-zinc-500 text-[10px]">
                  Review and correct details before approving.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-5">
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Match Name</label>
                    <Input
                      type="text"
                      required
                      value={matchName}
                      onChange={(e) => setMatchName(e.target.value)}
                      className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                    />
                    {validationErrors.matchName && (
                      <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.matchName}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Venue Name</label>
                      <Input
                        type="text"
                        required
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                      />
                      {validationErrors.venueName && (
                        <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.venueName}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">City</label>
                      <Input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                      />
                      {validationErrors.city && (
                        <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.city}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Address</label>
                    <Input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                    />
                    {validationErrors.address && (
                      <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.address}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Date & Time</label>
                    <DateTimePicker
                      value={screeningDatetime}
                      onChange={setScreeningDatetime}
                      error={validationErrors.screeningDatetime}
                    />
                    {validationErrors.screeningDatetime && (
                      <span className="text-[10px] text-red-500 font-medium mt-1.5 block">{validationErrors.screeningDatetime}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Google Maps Link</label>
                    <Input
                      type="text"
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                      className="w-full bg-zinc-950 border-zinc-900 text-xs h-9"
                    />
                    {validationErrors.googleMapsLink && (
                      <span className="text-[10px] text-red-500 font-medium mt-1 block">{validationErrors.googleMapsLink}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                    <Textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-zinc-950 border-zinc-900 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900/60">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(false)}
                      className="border-zinc-900 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      variant="default"
                      size="sm"
                      className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1 text-zinc-950" /> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CONFIRM REJECT MODAL */}
      {confirmRejectScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 border-zinc-900 bg-zinc-950 relative">
            <div className="text-center mb-4 flex flex-col items-center">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/20 text-red-400 border border-red-900/10 mb-3">
                <XCircle className="h-4.5 w-4.5" />
              </span>
              <CardTitle className="text-sm font-bold text-white">
                Reject Watch Submission?
              </CardTitle>
              <CardDescription className="mt-1.5 text-zinc-400 text-xs leading-relaxed">
                You are about to reject the watch party for <strong className="text-zinc-200">{confirmRejectScreening.match_name}</strong>.
              </CardDescription>
            </div>

            <div className="mb-4">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Rejection Reason / Notes (Optional)</label>
              <Input
                type="text"
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="e.g. Duplicate screening, invalid venue address"
                className="w-full bg-zinc-950 border-zinc-900 text-xs h-8.5"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setConfirmRejectScreening(null)}
                variant="outline"
                size="sm"
                className="border-zinc-900 text-zinc-450 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeReject}
                className="bg-red-650 hover:bg-red-700 text-white text-xs h-8.5"
              >
                Confirm Reject
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 border-zinc-900 bg-zinc-950 relative">
            <div className="text-center mb-6 flex flex-col items-center">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/20 text-red-500 border border-red-900/10 mb-3">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <CardTitle className="text-sm font-bold text-white">
                Delete Screening Permanently?
              </CardTitle>
              <CardDescription className="mt-2 text-zinc-400 text-xs leading-relaxed">
                Are you sure you want to permanently delete the watch party for <strong className="text-zinc-200">{confirmDeleteScreening.match_name}</strong>? This will remove all records from the database and cannot be undone.
              </CardDescription>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setConfirmDeleteScreening(null)}
                variant="outline"
                size="sm"
                className="border-zinc-900 text-zinc-450 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={executeDelete}
                variant="destructive"
                size="sm"
                className="text-xs h-8.5"
              >
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TOAST ALERTS */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold shadow-md bg-zinc-950 border-zinc-900 text-zinc-200">
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
