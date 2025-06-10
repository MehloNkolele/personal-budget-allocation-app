import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BudgetTemplate, Category } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon
} from '../constants';

interface BudgetTemplateManagerProps {
  templates: BudgetTemplate[];
  onSave: (templates: BudgetTemplate[]) => void;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  userId: string;
}

const BudgetTemplateManager: React.FC<BudgetTemplateManagerProps> = ({
  templates,
  onSave,
  onClose,
  formatCurrency,
  userId
}) => {
  const [editedTemplates, setEditedTemplates] = useState<BudgetTemplate[]>([...templates]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<BudgetTemplate>>({
    name: '',
    description: '',
    totalIncome: 0,
    categories: []
  });

  const handleSave = () => {
    onSave(editedTemplates);
    onClose();
  };

  const createTemplate = () => {
    if (!newTemplate.name?.trim()) return;

    const template: BudgetTemplate = {
      id: UserDataManager.generateTemplateId(),
      name: newTemplate.name.trim(),
      description: newTemplate.description?.trim() || '',
      totalIncome: newTemplate.totalIncome || 0,
      categories: newTemplate.categories || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditedTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', description: '', totalIncome: 0, categories: [] });
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-700/50 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Budget Templates</h3>
            <p className="text-slate-400 text-sm mt-1">
              Create and manage reusable budget structures
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-sky-400">Your Templates</h4>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Template</span>
            </button>
          </div>
          
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-700 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Create New Template</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-700/50 border border-slate-600 text-slate-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                      placeholder="Template Name (e.g., Monthly Base)"
                    />
                    <input
                      type="number"
                      value={newTemplate.totalIncome || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, totalIncome: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-700/50 border border-slate-600 text-slate-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                      placeholder="Optional: Target Income"
                    />
                  </div>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600 text-slate-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all mb-4"
                    placeholder="Optional: Description for this template"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button onClick={createTemplate} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                      Create Template
                    </button>
                    <button onClick={() => setShowCreateForm(false)} className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Templates List */}
          <div className="space-y-3">
            {editedTemplates.length === 0 && !showCreateForm ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentDuplicateIcon className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-1">No templates yet</p>
                <p className="text-sm text-slate-400">
                  Click 'New Template' to create a reusable budget.
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
        <div className="flex-shrink-0 flex justify-end items-center gap-3 p-4 bg-slate-800/50 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Redesigned Template Card
const TemplateCard: React.FC<{
  template: BudgetTemplate;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<BudgetTemplate>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  formatCurrency: (amount: number) => string;
}> = ({
  template,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  formatCurrency
}) => {
  const [editedName, setEditedName] = useState(template.name);
  const [editedIncome, setEditedIncome] = useState(template.totalIncome.toString());

  const handleSave = () => {
    onSave({ name: editedName, totalIncome: parseFloat(editedIncome) || 0 });
  };

  if (isEditing) {
    return (
      <div className="bg-slate-900/70 p-4 rounded-xl border border-sky-500">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full sm:flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            autoFocus
          />
          <input
            type="number"
            value={editedIncome}
            onChange={(e) => setEditedIncome(e.target.value)}
            className="w-full sm:w-48 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSave} className="bg-sky-600 text-white px-3 py-1 rounded-md text-sm font-semibold">Save</button>
          <button onClick={onCancel} className="bg-slate-600 text-white px-3 py-1 rounded-md text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-700/50 hover:bg-slate-700/80 p-4 rounded-xl border border-slate-700 transition-colors duration-200 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-white">{template.name}</p>
          <p className="text-sm text-slate-400 mt-1">{template.description || 'No description'}</p>
          <p className="text-sm text-sky-400 mt-2 font-mono">
            Target Income: {formatCurrency(template.totalIncome)}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-600/50 rounded-full"><PencilIcon className="w-4 h-4" /></button>
          <button onClick={onDuplicate} className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-600/50 rounded-full"><DocumentDuplicateIcon className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-600/50 rounded-full"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default BudgetTemplateManager;
