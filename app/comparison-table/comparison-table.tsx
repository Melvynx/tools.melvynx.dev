'use client';

import React, { useState, useEffect, useCallback } from 'react';

type Column = {
  id: number;
  name: string;
  image: string | null;
};

type CellIdentifier = {
  columnId: number;
  feature: string;
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useInlineEdit = () => {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = useCallback((id: number, currentValue: string) => {
    setEditingItem(id);
    setEditValue(currentValue);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingItem(null);
    setEditValue('');
  }, []);

  const saveEdit = useCallback((onSave: (value: string) => void) => {
    if (editValue.trim()) {
      onSave(editValue.trim());
      cancelEditing();
    }
  }, [editValue, cancelEditing]);

  return {
    editingItem,
    editValue,
    setEditValue,
    startEditing,
    cancelEditing,
    saveEdit
  };
};

const useRatingInput = (onRatingChange: (cell: CellIdentifier, rating: number | null) => void) => {
  const [selectedCell, setSelectedCell] = useState<CellIdentifier | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedCell && ['1', '2', '3', '4', '5', '0'].includes(e.key)) {
        if (e.key === '0') {
          onRatingChange(selectedCell, null);
        } else {
          const rating = parseInt(e.key);
          onRatingChange(selectedCell, rating);
        }
      }
      if (e.key === 'Escape') {
        setSelectedCell(null);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, onRatingChange]);

  return { selectedCell, setSelectedCell };
};

export const ComparisonTable = () => {
  const [columns, setColumns] = useLocalStorage<Column[]>('toolComparisonColumns', [
    { id: 1, name: '🤖 Claude', image: null },
    { id: 2, name: '🏄 Windsurf', image: null },
    { id: 3, name: '💻 Claude Code', image: null },
    { id: 4, name: '📝 VS Code', image: null }
  ]);

  const [features, setFeatures] = useLocalStorage<string[]>('toolComparisonFeatures', [
    'Agentic Code', 'Auto-complete', 'Quick-fix CMD+K', 'Quick commit',
    'Indexing code', 'Slash commands', 'Output styles', 'Price'
  ]);

  const [ratings, setRatings] = useLocalStorage<Record<string, number>>('toolComparisonRatings', {});

  const [newColumnName, setNewColumnName] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');

  const columnEdit = useInlineEdit();
  const featureEdit = useInlineEdit();

  const handleRatingChange = useCallback((cell: CellIdentifier, rating: number | null) => {
    setRatings(prev => {
      const newRatings = { ...prev };
      const key = `${cell.columnId}-${cell.feature}`;

      if (rating === null) {
        delete newRatings[key];
      } else {
        newRatings[key] = rating;
      }

      return newRatings;
    });
  }, [setRatings]);

  const { selectedCell, setSelectedCell } = useRatingInput(handleRatingChange);

  const addColumn = useCallback(() => {
    if (!newColumnName.trim()) return;

    const newId = Math.max(...columns.map(c => c.id), 0) + 1;
    setColumns(prev => [...prev, { id: newId, name: newColumnName.trim(), image: null }]);
    setNewColumnName('');
  }, [newColumnName, columns, setColumns]);

  const updateColumn = useCallback((columnId: number, newName: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, name: newName } : col
    ));
  }, [setColumns]);

  const updateColumnImage = useCallback((columnId: number, imageData: string | null) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, image: imageData } : col
    ));
  }, [setColumns]);

  const removeColumn = useCallback((columnId: number) => {
    setColumns(prev => prev.filter(col => col.id !== columnId));
    setRatings(prev => {
      const newRatings = { ...prev };
      Object.keys(newRatings).forEach(key => {
        if (key.startsWith(`${columnId}-`)) {
          delete newRatings[key];
        }
      });
      return newRatings;
    });
  }, [setColumns, setRatings]);

  const addFeature = useCallback(() => {
    if (!newFeatureName.trim()) return;

    setFeatures(prev => [...prev, newFeatureName.trim()]);
    setNewFeatureName('');
  }, [newFeatureName, setFeatures]);

  const updateFeature = useCallback((featureIndex: number, newName: string) => {
    const oldFeature = features[featureIndex];
    setFeatures(prev => prev.map((feature, index) =>
      index === featureIndex ? newName : feature
    ));

    setRatings(prev => {
      const newRatings = { ...prev };
      Object.keys(newRatings).forEach(key => {
        if (key.endsWith(`-${oldFeature}`)) {
          const newKey = key.replace(`-${oldFeature}`, `-${newName}`);
          newRatings[newKey] = newRatings[key];
          delete newRatings[key];
        }
      });
      return newRatings;
    });
  }, [features, setFeatures, setRatings]);

  const removeFeature = useCallback((featureIndex: number) => {
    const featureToRemove = features[featureIndex];
    setFeatures(prev => prev.filter((_, index) => index !== featureIndex));
    setRatings(prev => {
      const newRatings = { ...prev };
      Object.keys(newRatings).forEach(key => {
        if (key.endsWith(`-${featureToRemove}`)) {
          delete newRatings[key];
        }
      });
      return newRatings;
    });
  }, [features, setFeatures, setRatings]);

  const resetAll = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('toolComparisonColumns');
      localStorage.removeItem('toolComparisonFeatures');
      localStorage.removeItem('toolComparisonRatings');
      window.location.reload();
    }
  }, []);

  const getColumnTotal = useCallback((columnId: number) => {
    return features.reduce((total, feature) => {
      const rating = ratings[`${columnId}-${feature}`];
      return total + (rating || 0);
    }, 0);
  }, [features, ratings]);

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLTableCellElement>, columnId: number) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateColumnImage(columnId, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [updateColumnImage]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const getRatingStyles = (rating: number) => {
    const styles: Record<number, string> = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-blue-100 text-blue-800 border-blue-200',
      5: 'bg-green-100 text-green-800 border-green-200'
    };
    return styles[rating] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  type EditableTextProps = {
    value: string;
    isEditing: boolean;
    onStartEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    editValue: string;
    setEditValue: (value: string) => void;
    className?: string;
  };

  const EditableText = ({ value, isEditing, onStartEdit, onSave, onCancel, editValue, setEditValue, className = "" }: EditableTextProps) => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={onCancel}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
          className={`bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          autoFocus
        />
      );
    }

    return (
      <span
        onClick={onStartEdit}
        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
      >
        {value}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="New tool"
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addColumn()}
              />
              <button
                onClick={addColumn}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Column
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="New feature"
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              />
              <button
                onClick={addFeature}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Row
              </button>
            </div>
          </div>

          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-50 border border-red-300 rounded-md text-red-700 text-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset All
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-sm font-medium text-gray-900 border-r border-gray-200">
                    Features
                  </th>
                  {columns.map((column, index) => (
                    <th
                      key={column.id}
                      className={`p-4 text-center text-sm font-medium text-gray-900 ${index < columns.length - 1 ? 'border-r border-gray-200' : ''}`}
                      onDrop={(e) => handleImageDrop(e, column.id)}
                      onDragOver={handleDragOver}
                    >
                      <div className="relative flex flex-col items-center justify-center gap-2 group">
                        {column.image ? (
                          <div className="relative">
                            <img
                              src={column.image}
                              alt={column.name}
                              className="w-16 h-16 object-contain rounded"
                            />
                            <button
                              onClick={() => updateColumnImage(column.id, null)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <EditableText
                            value={column.name}
                            isEditing={columnEdit.editingItem === column.id}
                            onStartEdit={() => columnEdit.startEditing(column.id, column.name)}
                            onSave={() => columnEdit.saveEdit((newName) => updateColumn(column.id, newName))}
                            onCancel={columnEdit.cancelEditing}
                            editValue={columnEdit.editValue}
                            setEditValue={columnEdit.setEditValue}
                          />
                        )}
                        <button
                          onClick={() => removeColumn(column.id)}
                          className="absolute top-0 right-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {features.map((feature, featureIndex) => (
                  <tr key={feature} className="border-b border-gray-100 hover:bg-gray-25">
                    <td className="p-4 text-sm font-medium text-gray-900 border-r border-gray-200 group">
                      <div className="flex items-center justify-between">
                        <EditableText
                          value={feature}
                          isEditing={featureEdit.editingItem === featureIndex}
                          onStartEdit={() => featureEdit.startEditing(featureIndex, feature)}
                          onSave={() => featureEdit.saveEdit((newName) => updateFeature(featureIndex, newName))}
                          onCancel={featureEdit.cancelEditing}
                          editValue={featureEdit.editValue}
                          setEditValue={featureEdit.setEditValue}
                        />
                        <button
                          onClick={() => removeFeature(featureIndex)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                    {columns.map((column, colIndex) => {
                      const cellKey = `${column.id}-${feature}`;
                      const rating = ratings[cellKey];
                      const isSelected = selectedCell?.columnId === column.id && selectedCell?.feature === feature;

                      return (
                        <td
                          key={column.id}
                          className={`p-4 text-center cursor-pointer transition-all relative
                            ${colIndex < columns.length - 1 ? 'border-r border-gray-200' : ''}
                            ${isSelected ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : 'hover:bg-gray-50'}
                          `}
                          onClick={() => setSelectedCell({ columnId: column.id, feature })}
                        >
                          {rating ? (
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border ${getRatingStyles(rating)}`}>
                              {rating}
                            </div>
                          ) : isSelected ? (
                            <div className="text-xs text-gray-400">1-5, 0=reset</div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                  <td className="p-4 text-sm font-bold text-gray-900 border-r border-gray-200">
                    Total
                  </td>
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.id}
                      className={`p-4 text-center text-lg font-bold text-gray-900 ${colIndex < columns.length - 1 ? 'border-r border-gray-200' : ''}`}
                    >
                      {getColumnTotal(column.id)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-sm">
          {[1, 2, 3, 4, 5].map(rating => (
            <div key={rating} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border ${getRatingStyles(rating)}`}></div>
              <span className="text-gray-600">{rating}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
