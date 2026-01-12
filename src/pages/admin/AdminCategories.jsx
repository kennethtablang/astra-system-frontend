import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
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
import { Plus, Trash, Edit, Search, Tag } from "lucide-react";
import { LoadingSpinner } from "../../components/ui/Loading";
import categoryService from "../../services/categoryService";

const AdminCategories = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getCategories(searchTerm);
            setData(res.data?.items || res.data || []);
        } catch (error) {
            toast.error("Failed to load categories: " + error.message);

        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await categoryService.deleteCategory(id);
            toast.success("Category deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete category: " + error.message);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Category Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Organize your products with categories
                        </p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="py-4">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search categories..."
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
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableHeader>
                                <TableBody>
                                    {data.length > 0 ? (
                                        data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>#{item.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center">
                                                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                                                        {item.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.description || "No description"}</TableCell>
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
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                No categories found
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

export default AdminCategories;
