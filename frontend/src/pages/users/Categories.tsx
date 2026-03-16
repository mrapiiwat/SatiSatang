import { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import type { CategoriesType } from '../../interface/category';
import CategoryHeader from '../../components/user/category/CategoryHeader';
import CategoryList from '../../components/user/category/CategoryList';
import CategoryModal from '../../components/user/category/CategoryModal';
import PageWrapper from '../../components/PageWrapper';
import BackButton from '../../components/BackButton';

const Categories = () => {
  const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [categories, setCategories] = useState<CategoriesType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`/categories?type=${selectedType}`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchCategories();
  }, [selectedType, fetchCategories]);

  return (
    <PageWrapper animation="scale-fade">
      <BackButton />
      <div className="px-6 py-8 text-black-900">
        <CategoryHeader selectedType={selectedType} setSelectedType={setSelectedType} />

        <CategoryList
          categories={categories}
          setCategories={setCategories}
          onAddClick={() => setIsModalOpen(true)}
          refresh={fetchCategories}
          onSwipeLeft={() => {
            if (selectedType === 'INCOME') setSelectedType('EXPENSE');
          }}
          onSwipeRight={() => {
            if (selectedType === 'EXPENSE') setSelectedType('INCOME');
          }}
        />

        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedType={selectedType}
          refresh={fetchCategories}
        />
      </div>
    </PageWrapper>
  );
};

export default Categories;
