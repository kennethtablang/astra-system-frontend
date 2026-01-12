import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../../components/ui/Table";
import { toast } from "react-hot-toast";
import { Plus, Trash, Edit, MapPin, Search } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/Loading";
import locationService from "../../services/locationService";

const AdminLocations = () => {
    const [activeTab, setActiveTab] = useState("cities"); // 'cities' or 'barangays'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");


    useEffect(() => {
        fetchData();
    }, [activeTab]);



    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "cities") {
                const res = await locationService.getCities({ searchTerm });
                setData(res.data?.items || res.data || []);
            } else {
                const res = await locationService.getBarangays({ searchTerm });
                setData(res.data?.items || res.data || []);
            }
        } catch (error) {
            toast.error("Failed to load location data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this location?")) return;

        try {
            if (activeTab === 'cities') {
                await locationService.deleteCity(id);
            } else {
                await locationService.deleteBarangay(id);
            }
            toast.success("Deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete location: " + error.message);
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Location Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage service areas, cities, and barangays
                        </p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add {activeTab === "cities" ? "City" : "Barangay"}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("cities")}
                            className={`${activeTab === "cities"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Cities
                        </button>
                        <button
                            onClick={() => setActiveTab("barangays")}
                            className={`${activeTab === "barangays"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Barangays
                        </button>
                    </nav>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="py-4">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    {activeTab === 'cities' && <TableHead>Province</TableHead>}
                                    {activeTab === 'cities' && <TableHead>Region</TableHead>}
                                    {activeTab === 'barangays' && <TableHead>City</TableHead>}
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableHeader>
                                <TableBody>
                                    {data.length > 0 ? (
                                        data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>#{item.id}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                {activeTab === 'cities' && <TableCell>{item.province}</TableCell>}
                                                {activeTab === 'cities' && <TableCell>{item.region}</TableCell>}
                                                {activeTab === 'barangays' && <TableCell>{item.cityName || item.city?.name}</TableCell>}
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="mr-2">
                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                                                        <Trash className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                No locations found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminLocations;
