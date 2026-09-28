// app/dashboard/security/page.tsx
'use client';

import { ShieldCheck, Lock, FileCheck, Server } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-display text-[#3A2418] italic flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[#C6A15B]" /> Trust & Security
                </h1>
                <p className="text-[#806B58] mt-2">Enterprise-grade security built into the core of VEQ.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 */}
                <div className="bg-white p-6 rounded-2xl border border-[#E9DED0]">
                    <Lock className="w-8 h-8 text-[#C6A15B] mb-4" />
                    <h3 className="text-xl font-display text-[#3A2418] italic mb-2">Data Encryption at Rest</h3>
                    <p className="text-sm text-[#806B58]">All knowledge items, tasks, and employee data are encrypted using AES-256 standard via our managed database infrastructure.</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-2xl border border-[#E9DED0]">
                    <FileCheck className="w-8 h-8 text-[#C6A15B] mb-4" />
                    <h3 className="text-xl font-display text-[#3A2418] italic mb-2">Immutable Audit Logs</h3>
                    <p className="text-sm text-[#806B58]">Every action (creation, modification, deletion) is cryptographically logged. Administrators have full visibility into organizational activity.</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-2xl border border-[#E9DED0]">
                    <ShieldCheck className="w-8 h-8 text-[#C6A15B] mb-4" />
                    <h3 className="text-xl font-display text-[#3A2418] italic mb-2">Row-Level Security (RLS)</h3>
                    <p className="text-sm text-[#806B58]">Strict database-level policies ensure that users can only access data explicitly permitted by their company's Role-Based Access Control (RBAC).</p>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-6 rounded-2xl border border-[#E9DED0]">
                    <Server className="w-8 h-8 text-[#C6A15B] mb-4" />
                    <h3 className="text-xl font-display text-[#3A2418] italic mb-2">On-Premise Ready (BYOC)</h3>
                    <p className="text-sm text-[#806B58]">VEQ is fully Dockerized. For enterprises with strict data residency requirements, we support Bring Your Own Cloud (BYOC) deployments.</p>
                </div>
            </div>

            <div className="mt-8 p-6 bg-[#F4EDE1]/50 rounded-2xl border border-[#E9DED0] text-center">
                <p className="text-sm font-mono text-[#806B58]">
                    Looking for SOC 2 Type II or FedRAMP documentation? <br />
                    <span className="text-[#3A2418] font-semibold">Contact our Enterprise Sales team for our latest compliance reports.</span>
                </p>
            </div>
        </div>
    );
}