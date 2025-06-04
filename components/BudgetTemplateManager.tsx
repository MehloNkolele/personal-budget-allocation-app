import React, { useState } from 'react';
import { BudgetTemplate, Category } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  DocumentDuplicateIcon
} from '../constants';

interface BudgetTemplateManagerProps {
  templates: BudgetTemplate[];
  onSave: (templates: BudgetTemplate[]) => void;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
  userId: string;
}

const BudgetTemplateManager: React.FC<BudgetTemplateManagerProps> = ({
  templates,
  onSave,
  onClose,
  formatCurrency,
  selectedCurrency,
  userId
}) => {
  const [editedTemplates, setEditedTemplates] = useState<BudgetTemplate[]>([...templates]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    totalIncome: '',
    categories: [] as Omit<Category, 'spentAmount'>[]
  });

  const handleSave = () => {
    onSave(editedTemplates);
    onClose();
  };

  const createTemplate = () => {
    if (!newTemplate.name.trim()) return;

    const template: BudgetTemplate = {
      id: UserDataManager.generateTemplateId(),
      name: newTemplate.name.trim(),
      description: newTemplate.description.trim(),
      totalIncome: parseFloat(newTemplate.totalIncome) || 0,
      categories: newTemplate.categories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditedTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      description: '',
      totalIncome: '',
      categories: []
    });
    setShowCreateForm(false);
  };

  const updateTemplate = (templateId: string, updates: Partial<BudgetTemplate>) => {
    setEditedTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, ...updates, updatedAt: new Date().toISOString() }
          : template
      )
    );
  };

  const deleteTemplate = (templateId: string) => {
    setEditedTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const duplicateTemplate = (template: BudgetTemplate) => {
    const duplicated: BudgetTemplate = {
      ...template,
      id: UserDataManager.generateTemplateId(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditedTemplates(prev => [...prev, duplicated]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-semibold text-sky-400">Budget Templates</h3>
            <p className="text-slate-400 text-sm mt-1">
              Create and manage reusable budget templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create Template Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create New Template</span>
            </button>
          </div>

          {/* Create Template Form */}
          {showCreateForm && (
            <div className="bg-slate-700 p-6 rounded-lg border border-slate-600 mb-6">
              <h4 className="text-lg font-semibold text-sky-400 mb-4">Create New Template</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., Monthly Budget Template"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Total Income
                  </label>
                  <input
                    type="number"
                    value={newTemplate.totalIncome}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, totalIncome: e.target.value }))}
                    className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Optional description for this template"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={createTemplate}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTemplate({
                      name: '',
                      description: '',
                      totalIncome: '',
                      categories: []
                    });
                  }}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Templates List */}
          <div className="space-y-4">
            {editedTemplates.length === 0 ? (
              <div className="text-center py-8">
                <DocumentDuplicateIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No templates created yet</p>
                <p className="text-sm text-slate-500">
                  Create your first template to reuse budget structures
                </p>
              </div>
            ) : (
              editedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isEditing={editingTemplate === template.id}
                  onEdit={() => setEditingTemplate(template.id)}
                  onSave={(updates) => {
                    updateTemplate(template.id, updates);
                    setEditingTemplate(null);
                  }}
                  onCancel={() => setEditingTemplate(null)}
                  onDelete={() => deleteTemplate(template.id)}
                  onDuplicate={() => duplicateTemplate(template)}
                  formatCurrency={formatCurrency}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: BudgetTemplate;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<BudgetTemplate>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  formatCurrency: (amount: number) => string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  formatCurrency
}) => {
  const [editName, setEditName] = useState(template.name);
  const [editDescription, setEditDescription] = useState(template.description || '');
  const [editIncome, setEditIncome] = useState(template.totalIncome.toString());

  const handleSave = () => {
    onSave({
      name: editName.trim(),
      description: editDescription.trim(),
      totalIncome: parseFloat(editIncome) || 0
    });
  };

  const handleCancel = () => {
    setEditName(template.name);
    setEditDescription(template.description || '');
    setEditIncome(template.totalIncome.toString());
    onCancel();
  };

  return (
    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Income</label>
              <input
                type="number"
                value={editIncome}
                onChange={(e) => setEditIncome(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={2}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-200 mb-1">{template.name}</h4>
              {template.description && (
                <p className="text-sm text-slate-400 mb-2">{template.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-emerald-400">
                  Income: {formatCurrency(template.totalIncome)}
                </span>
                <span className="text-sky-400">
                  Categories: {template.categories.length}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={onDuplicate}
                className="text-purple-400 hover:text-purple-300 p-1"
                title="Duplicate Template"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onEdit}
                className="text-sky-400 hover:text-sky-300 p-1"
                title="Edit Template"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 p-1"
                title="Delete Template"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Created: {new Date(template.createdAt).toLocaleDateString()}
            {template.updatedAt !== template.createdAt && (
              <span className="ml-2">
                • Updated: {new Date(template.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTemplateManager;
