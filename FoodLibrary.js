import { useState } from 'react';
import { hotBuffetItems } from '../lib/hotBuffet';
import { coldBuffetItems } from '../lib/coldBuffet';
import { beverageItems } from '../lib/beverages';
import { coffeeBreakItems } from '../lib/coffeeBreak';
import { snackItems } from '../lib/snacks';
import { stationItems } from '../lib/stations';
import { dessertItems } from '../lib/desserts';
import { containsProfanity } from '../lib/profanityFilter';

const FoodLibrary = ({ onBack }) => {
  const factoryDefaultItems = {
    ...hotBuffetItems,
    ...coldBuffetItems,
    ...beverageItems,
    ...coffeeBreakItems,
    ...snackItems,
    ...stationItems,
    ...dessertItems,
  };

  const [foodItems, setFoodItems] = useState(factoryDefaultItems);
  const [newItem, setNewItem] = useState({ category: '', name: '' });
  const [editingItem, setEditingItem] = useState({ category: '', oldName: '', newName: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const showFeedback = (message, type, duration = 3000) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), duration);
  };

  const handleAddItem = () => {
    if (containsProfanity(newItem.name)) {
      showFeedback('Inappropriate language is not allowed.', 'error');
      return;
    }
    if (newItem.category && newItem.name) {
      setFoodItems(prevItems => {
        const newItems = { ...prevItems };
        if (newItems[newItem.category]) {
          newItems[newItem.category] = [...newItems[newItem.category], newItem.name];
        } else {
          newItems[newItem.category] = [newItem.name];
        }
        return newItems;
      });
      setNewItem({ category: '', name: '' });
      showFeedback('Item added successfully!', 'success');
    } else {
      showFeedback('Please provide a name and select a category.', 'error');
    }
  };

  const handleStartEditing = (category, item) => {
    setEditingItem({ category, oldName: item, newName: item });
  };

  const handleSaveEdit = () => {
    if (containsProfanity(editingItem.newName)) {
      showFeedback('Inappropriate language is not allowed.', 'error');
      return;
    }
    setFoodItems(prevItems => {
      const newItems = { ...prevItems };
      const index = newItems[editingItem.category].indexOf(editingItem.oldName);
      if (index !== -1) {
        newItems[editingItem.category][index] = editingItem.newName;
      }
      return newItems;
    });
    setEditingItem({ category: '', oldName: '', newName: '' });
    showFeedback('Item updated successfully!', 'success');
  };

  const handleDeleteItem = (category, itemToDelete) => {
    setFoodItems(prevItems => {
      const newItems = { ...prevItems };
      newItems[category] = newItems[category].filter(item => item !== itemToDelete);
      return newItems;
    });
    showFeedback('Item deleted.', 'success');
  };

  const handleReset = () => {
    setFoodItems(factoryDefaultItems);
    showFeedback('Library has been reset to factory defaults.', 'success');
  };

  return (
    <div className="card">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-center sm:text-left">Food Library</h2>
        <button onClick={onBack} className="btn btn-gray w-full sm:w-auto flex-shrink-0">Back to Dashboard</button>
      </div>

      <div className="card mb-8 bg-gray-50">
        <h3 className="mb-4">Add New Item</h3>
        {feedback.message && (
          <p className={`mb-4 text-sm font-medium ${feedback.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {feedback.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="New Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="input-field flex-grow"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="input-field"
          >
            <option value="">Select a Category</option>
            {Object.keys(foodItems).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button onClick={handleAddItem} className="btn btn-green">Add Item</button>
        </div>
      </div>

      <div className="space-y-2">
        {Object.keys(foodItems).map(category => (
          <details key={category} className="border rounded-lg overflow-hidden" open>
            <summary className="font-semibold text-lg p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-between items-center">
              {category}
              <span className="text-gray-500 text-sm font-normal">({foodItems[category].length} items)</span>
            </summary>
            <ul className="p-4 divide-y">
              {foodItems[category].map(item => (
                <li key={item} className="flex justify-between items-center py-3">
                  {editingItem.oldName === item ? (
                    <input
                      type="text"
                      value={editingItem.newName}
                      onChange={(e) => setEditingItem({ ...newItem, newName: e.target.value })}
                      onBlur={handleSaveEdit}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      className="input-field"
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => handleStartEditing(category, item)} className="text-gray-700 cursor-pointer hover:text-blue-600 p-2">
                      {item}
                    </span>
                  )}
                  <button onClick={() => handleDeleteItem(category, item)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 font-bold hover:bg-red-100 text-xl ml-4">×</button>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={handleReset} className="btn btn-red">Reset to Factory Default</button>
      </div>
    </div>
  );
};

export default FoodLibrary;
