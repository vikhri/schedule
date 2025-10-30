import { useState, useEffect } from 'react';
import { ExternalLink, Trash2, Edit2, Plus, ArrowLeft } from 'lucide-react';
import { supabase, Link } from '../lib/supabase';
import { LinkForm } from '../components/LinkForm';

type MaterialsProps = {
  isAdmin: boolean;
  onBack: () => void;
};

export function Materials({ isAdmin, onBack }: MaterialsProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('category', 'materials')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setShowLinkForm(true);
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setShowLinkForm(true);
  };

  const handleSaveLink = async (data: Omit<Link, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('links')
          .update(data)
          .eq('id', editingLink.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('links')
          .insert([data]);

        if (error) throw error;
      }

      await fetchLinks();
      setShowLinkForm(false);
      setEditingLink(null);
    } catch (error) {
      console.error('Error saving link:', error);
      alert('Ошибка при сохранении материала');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Ошибка при удалении материала');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к расписанию
        </button>
        <div className="flex items-center justify-between">
          {isAdmin && (
            <button
              onClick={handleAddLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {links.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {isAdmin ? 'Нажмите "Добавить", чтобы создать первый материал' : 'Нет материалов'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {links.map((link) => (
                <div key={link.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-lg text-gray-900 hover:text-blue-600 flex-1"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{link.title}</span>
                    </a>
                    {isAdmin && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditLink(link)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showLinkForm && (
        <LinkForm
          link={editingLink}
          category="materials"
          onSave={handleSaveLink}
          onCancel={() => {
            setShowLinkForm(false);
            setEditingLink(null);
          }}
        />
      )}
    </div>
  );
}
