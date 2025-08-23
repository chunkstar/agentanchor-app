import { useState } from 'react';
import { equipmentItems } from '../lib/equipment';
import { essentialEquipment } from '../lib/essentials';

const SchematicBuilder = ({ schematicItems, setSchematicItems }) => {
  const [equipment, setEquipment] = useState({
    ...equipmentItems,
    ...essentialEquipment,
  });
  const [selectedItem, setSelectedItem] = useState(null);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  const handleDrop = (e) => {
    const item = JSON.parse(e.dataTransfer.getData("item"));
    setSchematicItems([...schematicItems, { ...item, x: e.clientX, y: e.clientY, rotation: 0, zIndex: schematicItems.length }]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleItemClick = (index) => {
    setSelectedItem(index);
  };

  const handleRotate = () => {
    if (selectedItem !== null) {
      const newItems = [...schematicItems];
      newItems[selectedItem].rotation += 45;
      setSchematicItems(newItems);
    }
  };

  const handleDelete = () => {
    if (selectedItem !== null) {
      const newItems = schematicItems.filter((_, index) => index !== selectedItem);
      setSchematicItems(newItems);
      setSelectedItem(null);
    }
  };

  const handleBringForward = () => {
    if (selectedItem !== null) {
      const newItems = [...schematicItems];
      newItems[selectedItem].zIndex += 1;
      setSchematicItems(newItems);
    }
  };

  const handleSendBackward = () => {
    if (selectedItem !== null) {
      const newItems = [...schematicItems];
      newItems[selectedItem].zIndex -= 1;
      setSchematicItems(newItems);
    }
  };

  return (
    <div id="schematic-builder-view">
      <div id="schematic-canvas-container" onDrop={handleDrop} onDragOver={handleDragOver}>
        <div id="schematic-canvas">
          {schematicItems.map((item, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                transform: `rotate(${item.rotation}deg)`,
                border: selectedItem === index ? '2px solid blue' : '1px solid black',
                padding: '5px',
                zIndex: item.zIndex
              }}
              onClick={() => handleItemClick(index)}
            >
              {item.text || item.item}
            </div>
          ))}
        </div>
      </div>
      <div id="table-controls" className="text-center my-4 flex justify-center items-center gap-4">
        <button id="remove-table-btn" className="px-4 py-2 bg-red-500 text-white rounded-md text-sm">- Remove Table</button>
        <span id="table-count" className="mx-4 font-medium">3 Tables (6 ft)</span>
        <button id="add-table-btn" className="px-4 py-2 bg-green-500 text-white rounded-md text-sm">+ Add Table</button>
        <button id="reset-layout-btn" className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm">Reset Layout</button>
      </div>
      
      <div id="schematic-item-toolbar" className="my-4 p-2 bg-gray-100 rounded-lg flex justify-center items-center gap-2">
        <span className="text-sm font-medium mr-4">Selected Item:</span>
        <button onClick={handleRotate} id="schematic-rotate-btn" className="px-3 py-2 bg-white rounded-md shadow-sm border text-sm">Rotate 45°</button>
        <button onClick={handleBringForward} id="schematic-bring-forward-btn" className="px-3 py-2 bg-white rounded-md shadow-sm border text-sm">Bring Forward</button>
        <button onClick={handleSendBackward} id="schematic-send-backward-btn" className="px-3 py-2 bg-white rounded-md shadow-sm border text-sm">Send Backward</button>
        <button onClick={handleDelete} id="schematic-delete-btn" className="px-3 py-2 bg-red-500 text-white rounded-md shadow-sm border text-sm">Delete</button>
      </div>

      <div id="schematic-palette" className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(equipment).map(item => (
            <div key={item} draggable onDragStart={(e) => handleDragStart(e, equipment[item])} className="schematic-palette-item">
              {equipment[item].text || item}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Schematic Items</h2>
        <ul id="schematic-item-list" className="space-y-3">
          {schematicItems.map((item, index) => (
            <li key={index} className="flex justify-between items-center py-2 border-b">
              <span>{item.text || item.item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SchematicBuilder;
