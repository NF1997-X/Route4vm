import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  MapPin,
  Share2,
  List,
  HelpCircle,
  Sparkles,
  FileSpreadsheet,
  Route,
  Download,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  // Fetch pages/tables
  const { data: pages } = useQuery<any[]>({
    queryKey: ["/api/pages"],
  });

  // Fetch custom tables
  const { data: customTables } = useQuery<any[]>({
    queryKey: ["/api/custom-tables"],
  });

  const totalPages = pages?.length || 0;
  const totalCustomTables = customTables?.length || 0;

  return (
    <div className="w-full h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Route className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Route4vm
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aplikasi manajemen rute dan tabel dengan fitur optimasi, peta interaktif, dan kolaborasi
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tabel</CardTitle>
              <Table className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPages}</div>
              <p className="text-xs text-muted-foreground">Tabel utama aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tabel Custom</CardTitle>
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomTables}</div>
              <p className="text-xs text-muted-foreground">Tabel khusus dibuat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fitur Aktif</CardTitle>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12+</div>
              <p className="text-xs text-muted-foreground">Fitur tersedia</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Table className="w-6 h-6 text-primary" />
                  <CardTitle>Tabel Utama</CardTitle>
                </div>
                <CardDescription>
                  Kelola data rute pengiriman dengan tabel interaktif lengkap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Peta interaktif dengan Leaflet</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Route className="w-4 h-4" />
                  <span>Optimasi rute otomatis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>Export CSV & bulk operations</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/custom-tables">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <List className="w-6 h-6 text-primary" />
                  <CardTitle>Tabel Custom</CardTitle>
                </div>
                <CardDescription>
                  Buat dan kelola tabel khusus sesuai kebutuhan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="w-4 h-4" />
                  <span>Kustomisasi kolom dinamis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan dengan QR code</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{totalCustomTables} tabel tersimpan</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Route className="w-5 h-5" />
                  Optimasi Rute
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Hitung rute terpendek secara otomatis dengan OpenRouteService API
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Peta Interaktif
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Visualisasi lokasi dengan marker, mini-map, dan navigasi lengkap
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Berbagi & Kolaborasi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Bagikan tabel dengan QR code dan link yang aman
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Export ke CSV dengan bulk selection dan keyboard shortcuts
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Kustomisasi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Atur kolom, warna, filter, dan tampilan sesuai kebutuhan
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Dark Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Tema gelap yang nyaman dengan transisi mulus
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center pb-8">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Table className="w-4 h-4" />
              Buka Tabel Utama
            </Button>
          </Link>
          <Link href="/custom-tables">
            <Button size="lg" variant="outline" className="gap-2">
              <List className="w-4 h-4" />
              Kelola Tabel Custom
            </Button>
          </Link>
          <Link href="/help">
            <Button size="lg" variant="outline" className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Panduan & Bantuan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
