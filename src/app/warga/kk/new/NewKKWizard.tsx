"use client";

import React, { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createFamilyCard } from "@/server/actions/family-cards";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ScanLine,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import { scanImage, ScanResponse } from "@/lib/client/scan-image";

export function NewKKWizard() {
  const router = useRouter();

  // Wizard state: 1 = Scan / Upload, 2 = Form Review & Submit
  const [step, setStep] = useState<1 | 2>(1);

  // OCR state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState("");
  const [extractedData, setExtractedData] = useState<ScanResponse | null>(null);
  const defaultFormData: ScanResponse = {
    no: '',
    alamat: '',
    kabupaten_kota: '',
    kecamatan: "",
    kode_pos: "",
    provinsi: "",
    anggota: [],
    kepala_keluarga: '',
    rt: '',
    rw: ''
  }
  // Form State
  const [formData, setFormData] = useState<ScanResponse>(defaultFormData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form submission action
  const [state, formAction, isPending] = useActionState(
    async (prev: any, fData: FormData) => {
      const res = await createFamilyCard(prev, fData);
      if (res?.success && res.id) {
        router.push(`/warga/kk/${res.id}`);
      }
      return res;
    },
    null
  );

  // Run OCR processing on image
  const processImage = async (imageSrc: File, presetText?: string) => {
    setSelectedImage(imageSrc);
    setIsScanning(true);
    setScanProgress(15);
    setScanStatusText("Memuat mesin pemindai OCR...");

    try {

      // Client-side Tesseract.js OCR for real uploaded photos
      setScanProgress(30);
      setScanStatusText("Menganalisis struktur dokumen Kartu Keluarga...");
      const parsed = await scanImage(imageSrc);
      if (!parsed) {
        setScanProgress(0)
        return
      }
      setScanProgress(100);
      setScanStatusText("Ekstraksi data selesai!");
      setExtractedData(parsed);
      setFormData(parsed);
    } catch (err) {
      console.warn("OCR fallback to basic parser:", err);
      // Fallback
      setExtractedData(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step === 1
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "bg-emerald-100 text-emerald-700"
              }`}
          >
            {step === 2 && extractedData ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              "1"
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-none">
              Scan Dokumen KK
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Ekstraksi teks otomatis via OCR
            </p>
          </div>
        </div>

        <div className="h-0.5 w-6 bg-slate-200" />

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${step === 2
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
              : "bg-slate-100 text-slate-500"
              }`}
          >
            2
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-none">
              Review & Simpan
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Konfirmasi data formulir
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File & Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ================= STEP 1: SCAN IMAGE ================= */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="p-4 space-y-3.5 bg-gradient-to-b from-blue-50/40 via-white to-white border-blue-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pindai Foto Kartu Keluarga
                </h3>
                <p className="text-xs text-slate-500">
                  Ambil foto atau upload gambar KK fisik untuk mengisi form secara otomatis
                </p>
              </div>
            </div>

            {/* Action Buttons: Camera & Upload */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                type="button"


                className="flex items-center justify-center gap-2 font-semibold h-11"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
                <span>Foto Kamera</span>
              </Button>

              <Button
                type="button"
                variant="outline"

                className="flex items-center justify-center gap-2 font-semibold h-11 border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Galeri</span>
              </Button>
            </div>

            {/* Image Preview & Scanning Effect */}
            {selectedImage && (
              <div className="space-y-3 pt-2">
                <div className="relative rounded-2xl overflow-hidden border-2 border-blue-400 bg-slate-900 aspect-[16/10] flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview Dokumen KK"
                    className="w-full h-full object-contain"
                  />

                  {/* Laser Scanning Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[1px] flex flex-col justify-between overflow-hidden">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse" />
                      <div className="p-3 bg-black/60 backdrop-blur-md m-3 rounded-xl text-white text-center space-y-1.5">
                        <p className="text-xs font-semibold flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                          <span>{scanStatusText}</span>
                        </p>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Extracted Data Preview Summary */}
                {extractedData && !isScanning && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Ekstraksi OCR Berhasil!</span>
                      </div>
                      <Badge variant="success" size="sm">
                        Siap Digunakan
                      </Badge>
                    </div>

                    <div className="text-[11px] text-emerald-950 space-y-1 bg-white/70 p-2.5 rounded-xl border border-emerald-100 font-mono">
                      <p>
                        <strong className="font-sans">No. KK:</strong>{" "}
                        {extractedData.no || "(Tidak terdeteksi jelas)"}
                      </p>
                      <p>
                        <strong className="font-sans">Kepala Keluarga:</strong>{" "}
                        {extractedData.kepala_keluarga || "(Tidak terdeteksi jelas)"}
                      </p>
                      <p className="truncate">
                        <strong className="font-sans">Alamat:</strong>{" "}
                        {extractedData.alamat || "(Tidak terdeteksi jelas)"}
                      </p>
                    </div>

                    <Button
                      type="button"


                      className="w-full font-semibold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setStep(2)}
                    >
                      <span>Lanjut ke Review Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Manual Skip Option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 underline"
            >
              Lewati pemindaian gambar & isi formulir secara manual &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: REVIEW & SUBMIT FORM ================= */}
      {step === 2 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1 h-7 text-slate-500"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-sm font-bold text-slate-900">
                Formulir Kartu Keluarga
              </h3>
            </div>

            {extractedData && (
              <Badge variant="info" size="sm" className="gap-1">
                <Sparkles className="w-3 h-3" />
                OCR Aktif
              </Badge>
            )}
          </div>

          {extractedData && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Form Terisi Otomatis!</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Kolom di bawah telah diisi dari hasil pemindaian OCR dokumen KK Anda. Silakan verifikasi dan lengkapi bila diperlukan.
                </p>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-3.5">
            {state?.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {state.error}
              </div>
            )}

            <div>
              <Input
                label="Nomor Kartu Keluarga (16 Digit)"
                name="nomorKK"
                type="text"
                value={formData.no}
                onChange={(e) =>
                  setFormData({ ...formData, no: e.target.value })
                }
                placeholder="Contoh: 3276011203050001"
                maxLength={16}
                required
                helperText="Nomor KK harus tepat 16 digit angka"
              />
            </div>

            <div>
              <Input
                label="Nama Kepala Keluarga"
                name="kepalaKeluarga"
                type="text"
                value={formData.kepala_keluarga}
                onChange={(e) =>
                  setFormData({ ...formData, kepala_keluarga: e.target.value })
                }
                placeholder="Nama lengkap kepala keluarga"
                required
              />
            </div>

            <div>
              <Input
                label="Alamat Rumah / Jalan"
                name="alamat"
                type="text"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                placeholder="Contoh: Jl. Melati No. 12, RT 001/RW 005"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="RT"
                name="rt"
                value={formData.rt ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, rt: e.target.value })
                }
                required
              />
              <Input
                label="RW"
                name="rw"
                value={formData.rw ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, rw: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Kota / Kabupaten"
                name="kota"
                value={formData.kabupaten_kota ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, kabupaten_kota: e.target.value })
                }
                required
              />
              <Input
                label="Provinsi"
                name="provinsi"
                value={formData.provinsi ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, provinsi: e.target.value })
                }
                required
              />
            </div>

            <Input
              label="Kode Pos"
              name="kodePos"
              type="text"
              value={formData.kode_pos ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, kode_pos: e.target.value })
              }
              placeholder="Contoh: 16415"
              maxLength={5}
            />

            <div className="flex gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Scan Ulang
              </Button>

              <Button
                type="submit"

                size="lg"
                className="flex-[2] font-semibold shadow-md shadow-blue-500/20"
                disabled={isPending}
              >
                Simpan Kartu Keluarga
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
