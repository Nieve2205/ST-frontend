import React, { useState, useEffect } from 'react';
import { useUpdateLost } from '@/modules/production/hook/useLost';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

type Production = {
  id: string;
  name: string;
  product_name: string;
};

interface EditLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  productions: Production[];
  lostData: {
    id: string;
    production_id: string;
    quantity: number;
    lost_type: string;
    observations: string;
  };
}

const EditLostModal: React.FC<EditLostModalProps> = ({ isOpen, onClose, productions, lostData }) => {
  const updateLostMutation = useUpdateLost();

  const [productionId, setProductionId] = useState(lostData.production_id);
  const [quantity, setQuantity] = useState(lostData.quantity);
  const [lostType, setLostType] = useState(lostData.lost_type);
  const [observations, setObservations] = useState(lostData.observations);

  useEffect(() => {
    if (isOpen && lostData) {
        setProductionId(lostData.production_id);
        setQuantity(lostData.quantity);
        setLostType(lostData.lost_type);
        setObservations(lostData.observations);
    }
  }, [isOpen, lostData.id]); 


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productionId || quantity <= 0 || !lostType) {
      toast.error('Completa todos los campos correctamente');
      return;
    }

    try {
      await updateLostMutation.mutateAsync({
        id: lostData.id,
        payload: {
          production_id: productionId,
          quantity,
          lost_type: lostType,
          observations,
        },
      });
      toast.success('Pérdida actualizada correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar la pérdida');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Editar Pérdida</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-red-700 transition-colors text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Producción*</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={productionId}
              onChange={(e) => setProductionId(e.target.value)}
              required
            >
              <option value="">Selecciona una producción</option>
              {productions.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {productionId && (
              <div className="mt-2 text-sm text-gray-600">
                Producto:{' '}
                <span className="font-medium">
                  {productions.find(p => p.id === productionId)?.product_name || 'Desconocido'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad*</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de pérdida*</label>
            <select
              value={lostType}
              onChange={(e) => setLostType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="Daño">Daño</option>
              <option value="Pérdida">Pérdida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Opcional"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateLostMutation.status === 'pending'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {updateLostMutation.status === 'pending' ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLostModal;
