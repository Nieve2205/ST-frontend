import React, { useState } from 'react';
import { FiFilter, FiSearch, FiPlus, FiTrash2, FiEdit, FiAlertTriangle } from 'react-icons/fi';
import { useFetchAllLost, useDeleteLost } from '@/modules/production/hook/useLost';
import { useFetchProductions } from '@/modules/production/hook/useProductions';
import AddLostModal from './modal-create-lost';
import EditLostModal from './modal-edit-lost';
import { useFetchProducts } from '@/modules/production/hook/useProducts';



const LostPage: React.FC = () => {
  const { data: lostData = [], isLoading, error } = useFetchAllLost();
  const { data: productions = [], isLoading: loadingProductions } = useFetchProductions();
  const { data: products = [], isLoading: loadingProducts } = useFetchProducts();
  const deleteLostMutation = useDeleteLost();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLost, setSelectedLost] = useState(null);

  // Obtener el nombre del producto
  const getProductNameByProductionId = (productionId: string): string => {
    const production = productions.find(p => p.id === productionId);
    if (!production) return 'Producto no encontrado';
    const product = products.find(prod => prod.id === production.productId);
    return product ? product.name : 'Producto no encontrado';
  };

  const filteredData = lostData.filter(item => {
    const productionName = getProductNameByProductionId(item.production_id).toLowerCase();
    const matchesSearch = productionName.includes(searchTerm.toLowerCase()) || 
                         item.observations?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.lost_type === selectedType;
    return matchesSearch && matchesType;
  });

  const lossTypes = ['all', ...new Set(lostData.map(item => item.lost_type))];

  const handleEditClick = (lost: any) => {
    // Buscamos la producción asociada al lost
    const production = productions.find(p => p.id === lost.production_id);
    // Buscamos el producto asociado a esa producción
    const product = production ? products.find(prod => prod.id === production.productId) : null;
    // Agregamos product_name al objeto lost
    const lostWithProductName = {
      ...lost,
      product_name: product ? product.name : 'Sin nombre'
    };
    setSelectedLost(lostWithProductName);
    setIsEditModalOpen(true);
  };

  // Nueva función para eliminar pérdida
  const handleDeleteClick = (lostId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta pérdida? Esta acción no se puede deshacer.')) {
      deleteLostMutation.mutate(lostId, {
        onSuccess: () => {
          alert('Pérdida eliminada correctamente');
        },
        onError: (error: any) => {
          alert(`Error al eliminar pérdida: ${error.message || error}`);
        }
      });
    }
  };

  if (isLoading) return <div className="p-4">Cargando datos de pérdidas...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold pb-4 flex text-orange-500 items-center gap-2">
          <FiAlertTriangle size={24} />
          <span>Gestión de Pérdidas</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pérdidas..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative flex-grow">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {lossTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Todos los tipos' : type}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            disabled={false}
          >
            <FiPlus /> Nueva Pérdida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800">Total Pérdidas</h3>
          <p className="text-2xl font-bold text-blue-600">
            {lostData.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-red-800">Por Daños</h3>
          <p className="text-2xl font-bold text-red-600">
            {lostData.filter(item => item.lost_type === 'Daño').reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-sm font-medium text-yellow-800">Por Pérdidas</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {lostData.filter(item => item.lost_type === 'Pérdida').reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700 text-white text-xs uppercase sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left">Produccion</th>
              <th className="px-6 py-3 text-left">Cantidad</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-left">Observaciones</th>
              <th className="px-6 py-3 text-left">Fecha</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((lost) => (
                <tr key={lost.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getProductNameByProductionId(lost.production_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                      {lost.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lost.lost_type === 'Daño' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lost.lost_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {lost.observations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lost.created_at ? new Date(lost.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2 justify-center">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleEditClick(lost)}
                      >
                        <FiEdit />
                      </button>
                      {/* <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteClick(lost.id)}
                      >
                        <FiTrash2 />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron registros de pérdidas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddLostModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          productions={productions.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return {
              id: p.id,
              name: product ? product.name : 'Sin nombre', 
              product_name: product ? product.name : 'Sin nombre' 
            };
          })}
        />
      )}

      {isEditModalOpen && selectedLost && (
        <EditLostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productions={productions.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            return {
              id: p.id,
              name: product ? product.name : 'Sin nombre',
              product_name: product ? product.name : 'Sin nombre'
            };
          })}
          lostData={selectedLost}
        />
      )}

    </div>
  );
};

export default LostPage;
