"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProofOfDeliveryProps {
  orderId: string;
  customerName: string;
  onDelivered: () => void;
  onClose: () => void;
}

export function ProofOfDeliveryModal({
  orderId,
  customerName,
  onDelivered,
  onClose,
}: ProofOfDeliveryProps) {
  const [recipientName, setRecipientName] = useState("");
  const [podNotes, setPodNotes] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onDelivered();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Proof of Delivery</h3>
            <p className="text-xs text-muted">
              {orderId} • {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted tracking-wider uppercase block mb-1">
              Received By (Name)
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. John Doe / Reception Desk"
              className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Signature Box Simulation */}
          <div>
            <label className="text-xs font-semibold text-muted tracking-wider uppercase block mb-1">
              Recipient Signature
            </label>
            <div
              onClick={() => setHasSignature(true)}
              className="h-24 border border-dashed border-border rounded-lg bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
            >
              {hasSignature ? (
                <div className="text-sm font-cursive text-primary font-bold italic">
                  ✍️ {recipientName || "Recipient Signature Recorded"}
                </div>
              ) : (
                <div className="text-xs text-muted text-center">
                  Tap here to capture digital touch signature
                </div>
              )}
            </div>
          </div>

          {/* Delivery Photo Simulation */}
          <div>
            <label className="text-xs font-semibold text-muted tracking-wider uppercase block mb-1">
              Delivery Photo (Optional)
            </label>
            <div
              onClick={() => setIsPhotoCaptured(true)}
              className="py-2.5 px-3 border border-border rounded-lg bg-muted/10 flex items-center justify-between cursor-pointer hover:bg-muted/20 text-xs"
            >
              <span>{isPhotoCaptured ? "📷 Photo attached (doorstep.jpg)" : "📸 Tap to attach doorstep photo"}</span>
              <span className="text-primary font-semibold">
                {isPhotoCaptured ? "Retake" : "Capture"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted tracking-wider uppercase block mb-1">
              Notes / Delivery Location
            </label>
            <input
              type="text"
              value={podNotes}
              onChange={(e) => setPodNotes(e.target.value)}
              placeholder="e.g. Left with front desk receptionist"
              className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-1/2">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!recipientName.trim() || isSubmitting}
              className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Complete Delivery"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
