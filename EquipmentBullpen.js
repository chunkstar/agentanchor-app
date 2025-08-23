import { useState } from 'react';
import { equipmentItems } from '../lib/equipment';
import { essentialEquipment } from '../lib/essentials';

const EquipmentBullpen = ({ onBack }) => {
  const factoryDefaultEquipment = {
    'Chafers & Hot Holding': {
      'chafer-full': equipmentItems['chafer-full'],
      'chafer-half': equipmentItems['chafer-half'],
      'chafer-round-lg': equipmentItems['chafer-round-lg'],
      'chafer-round-sm': equipmentItems['chafer-round-sm'],
    },
    'Serviceware & Platters': {
      'bowl-large': equipmentItems['bowl-large'],
      'bowl-medium': equipmentItems['bowl-medium'],
      'bowl-small': equipmentItems['bowl-small'],
      'platter-sm': equipmentItems['platter-sm'],
      'platter-md': equipmentItems['platter-md'],
      'platter-lg': equipmentItems['platter-lg'],
    },
    'Risers & Decor': {
      'riser-12x12-sm': equipmentItems['riser-12x12-sm'],
      'riser-12x12-md': equipmentItems['riser-12x12-md'],
      'riser-12x12-tall': equipmentItems['riser-12x12-tall'],
      'riser-8x20-sm': equipmentItems['riser-8x20-sm'],
      'riser-8x20-md': equipmentItems['riser-8x20-md'],
      'riser-8x20-tall': equipmentItems['riser-8x20-tall'],
      'riser-16x20-sm': equipmentItems['riser-16x20-sm'],
      'riser-16x20-md': equipmentItems['riser-16x20-md'],
      'riser-16x20-tall': equipmentItems['riser-16x20-tall'],
      'decor-sm': equipmentItems['decor-sm'],
      'decor-md': equipmentItems['decor-md'],
      'decor-lg': equipmentItems['decor-lg'],
    },
    'Essentials': {
      'plates-9': essentialEquipment['plates-9'],
      'plates-10': essentialEquipment['plates-10'],
      'plates-12': essentialEquipment['plates-12'],
      'rollups': essentialEquipment['rollups'],
      'napkins-beverage': essentialEquipment['napkins-beverage'],
      'caddy-fork': essentialEquipment['caddy-fork'],
      'caddy-knife': essentialEquipment['caddy-knife'],
      'caddy-spoon': essentialEquipment['caddy-spoon'],
    }
  };

  const [equipment, setEquipment] = useState(factoryDefaultEquipment);
  const [editingItem, setEditingItem] = useState({ category: null, key: null });

  const handleDeleteItem = (category, itemKey) => {
    setEquipment(prev => {
      const newEquipment = { ...prev };
      delete newEquipment[category][itemKey];
      return newEquipment;
    });
  };

  const handleReset = () => {
    setEquipment(factoryDefaultEquipment);
  };
  
  const handleStartEditing = (category, key) => {
    setEditingItem({ category, key });
  };

  const handleSaveEdit = (category, key, newProperties) => {
    try {
      const parsedProperties = JSON.parse(newProperties);
      setEquipment(prev => {
        const newEquipment = { ...prev };
        newEquipment[category][key] = parsedProperties;
        return newEquipment;
      });
    } catch (error) {
      console.error("Invalid JSON format for equipment properties:", error);
    }
    setEditingItem({ category: null, key: null });
  };


  return (
    <div className="card">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-center sm:text-left">Equipment Bullpen</h2>
        <button onClick={onBack} className="btn btn-gray w-full sm:w-auto flex-shrink-0">Back to Dashboard</button>
      </div>

      <div className="card mb-8 bg-gray-50">
        <h3 className="mb-4">Add New Equipment</h3>
        <p className="text-gray-600 mb-4">Adding new equipment with a form will be available in a future update.</p>
        <button className="btn btn-green" disabled>Add New Item</button>
      </div>

      <div className="space-y-2">
        {Object.keys(equipment).map(category => (
          <details key={category} className="border rounded-lg overflow-hidden" open>
            <summary className="font-semibold text-lg p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
              {category}
              <span className="text-gray-500 text-sm font-normal">({Object.keys(equipment[category]).length} items)</span>
            </summary>
            <div className="p-4 divide-y">
              {Object.keys(equipment[category]).map(key => (
                <div key={key} className="py-3">
                  {editingItem.key === key ? (
                    <div>
                      <h4 className="font-semibold mb-2">{key}</h4>
                      <textarea
                        className="input-field w-full h-32 font-mono text-sm"
                        defaultValue={JSON.stringify(equipment[category][key], null, 2)}
                        onBlur={(e) => handleSaveEdit(category, key, e.target.value)}
                        autoFocus
                      />
                       <button onClick={() => setEditingItem({ category: null, key: null })} className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold cursor-pointer hover:text-blue-600" onClick={() => handleStartEditing(category, key)}>{key}</h4>
                        <pre className="text-sm bg-gray-100 p-2 rounded-md font-mono mt-2">{JSON.stringify(equipment[category][key], null, 2)}</pre>
                      </div>
                      <button onClick={() => handleDeleteItem(category, key)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 font-bold hover:bg-red-100 text-xl ml-4">×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={handleReset} className="btn btn-red">Reset to Factory Default</button>
      </div>
    </div>
  );
};

export default EquipmentBullpen;
