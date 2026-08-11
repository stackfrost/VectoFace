"use client";

import { useState, useEffect } from "react";

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth state
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // New Affiliate Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newRef, setNewRef] = useState("");
  const [newName, setNewName] = useState("");
  const [newUpi, setNewUpi] = useState("");

  const fetchAffiliates = () => {
    setIsLoading(true);
    fetch("/api/admin/affiliates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.affiliates) setAffiliates(data.affiliates);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isAuthorized) fetchAffiliates();
  }, [isAuthorized]);

  const handleAuth = async () => {
    if (!password) return;
    setIsAuthenticating(true);
    
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
      } else {
        alert("Incorrect password");
      }
    } catch (err) {
      alert("Authentication failed.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleClearBalance = async (affiliateId: string, name: string, amount: number) => {
    if (!confirm(`Are you sure you sent ₹${amount} via UPI to ${name}? This will reset their unpaid balance to zero.`)) return;

    const res = await fetch("/api/admin/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affiliateId }),
    });

    if (res.ok) {
      fetchAffiliates();
    } else {
      alert("Failed to clear balance.");
    }
  };

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef || !newName || !newUpi) return alert("Fill all fields");
    setIsCreating(true);

    const res = await fetch("/api/admin/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        refCode: newRef, 
        adminName: newName, 
        upiId: newUpi 
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert(`Success! Code ${newRef} created with a default 25% discount.`);
      setNewRef(""); setNewName(""); setNewUpi("");
      fetchAffiliates();
    } else {
      alert(data.error || "Failed to create affiliate");
    }
    setIsCreating(false);
  };

  // Secure Auth View
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="p-6 rounded-2xl glass-panel max-w-sm w-full space-y-4">
          <h1 className="text-sm font-mono text-zinc-400 uppercase tracking-widest text-center">Admin Portal</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAuth();
            }}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="w-full py-2.5 rounded-lg bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-300 font-mono text-xs font-semibold disabled:opacity-50"
          >
            {isAuthenticating ? "Authenticating..." : "Authenticate"}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 mb-2">
            INTERNAL OPERATIONS
          </div>
          <h1 className="text-2xl font-medium text-white">Affiliate & Payout Hub</h1>
        </div>
        <button
          onClick={fetchAffiliates}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Affiliate Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreateAffiliate} className="p-5 rounded-2xl glass-panel space-y-4 border-t-2 border-t-purple-500/50 sticky top-4">
            <h2 className="text-sm font-mono text-purple-400 uppercase">Generate New Code</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Promo Code (e.g. INSTA25)</label>
                <input required type="text" value={newRef} onChange={e => setNewRef(e.target.value.toUpperCase())} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500 uppercase" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Admin / Page Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">UPI ID (For Payouts)</label>
                <input required type="text" value={newUpi} onChange={e => setNewUpi(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-500" />
              </div>
              <button disabled={isCreating} type="submit" className="w-full py-2.5 rounded-lg bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-300 font-mono text-xs font-semibold mt-2 disabled:opacity-50">
                {isCreating ? "Generating..." : "Create Affiliate & Coupon"}
              </button>
            </div>
          </form>
        </div>

        {/* Affiliate Roster */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">Active Roster & Balances</h2>
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono animate-pulse">Loading roster...</div>
          ) : affiliates.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-panel text-zinc-400 text-sm">
              No affiliates found. Create your first one on the left!
            </div>
          ) : (
            affiliates.map((aff) => (
              <div key={aff.id} className="p-5 rounded-2xl glass-panel space-y-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/[0.02]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{aff.adminName}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-300">
                      {aff.refCode}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">UPI: <span className="text-emerald-400">{aff.upiId}</span></p>
                  <div className="flex gap-4 text-[10px] text-zinc-500 font-mono pt-1">
                    <span>Sales: {aff.totalSalesCount}</span>
                    <span>Lifetime Paid: ₹{aff.totalPaid}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-zinc-500 block">Owed Balance</span>
                    <span className={`text-lg font-bold ${aff.unpaidBalance > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
                      ₹{aff.unpaidBalance}
                    </span>
                  </div>

                  <button
                    onClick={() => handleClearBalance(aff.id, aff.adminName, aff.unpaidBalance)}
                    disabled={aff.unpaidBalance <= 0}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[10px] font-semibold disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    Mark Paid
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}