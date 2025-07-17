import React, { useState, useEffect } from 'react';
import UserModal from './UserModal';

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 🎯 Состояние для сортировки
    const [sortConfig, setSortConfig] = useState({
        field: null,
        direction: 'none'
    });

    // 🎯 Состояние для фильтрации
    const [filters, setFilters] = useState({
        search: '',
        gender: '',
        country: '',
        ageMin: '',
        ageMax: ''
    });

    // 🎯 Состояние для пагинации
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10
    });

    // 🎯 Состояние для модального окна
    const [modal, setModal] = useState({
        isOpen: false,
        selectedUser: null
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('https://dummyjson.com/users');
                
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                setUsers(data.users || []);
                
            } catch (error) {
                setError(error.message);
                console.error('Ошибка загрузки пользователей:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // 🎯 Логика сортировки с тремя состояниями
    const handleSort = (field) => {
        setSortConfig(prev => {
            if (prev.field !== field) {
                return { field, direction: 'asc' };
            }
            
            switch (prev.direction) {
                case 'none':
                    return { field, direction: 'asc' };
                case 'asc':
                    return { field, direction: 'desc' };
                case 'desc':
                    return { field, direction: 'none' };
                default:
                    return { field, direction: 'asc' };
            }
        });
        
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // 🎯 Функция фильтрации пользователей
    const getFilteredUsers = () => {
        return users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName} ${user.maidenName || ''}`.toLowerCase();
            const searchLower = filters.search.toLowerCase();
            
            const matchesSearch = !filters.search || 
                fullName.includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.phone.includes(filters.search) ||
                user.address?.city?.toLowerCase().includes(searchLower) ||
                user.address?.country?.toLowerCase().includes(searchLower);

            const matchesGender = !filters.gender || user.gender === filters.gender;
            const matchesCountry = !filters.country || 
                user.address?.country?.toLowerCase().includes(filters.country.toLowerCase());
            const matchesAgeMin = !filters.ageMin || user.age >= parseInt(filters.ageMin);
            const matchesAgeMax = !filters.ageMax || user.age <= parseInt(filters.ageMax);

            return matchesSearch && matchesGender && matchesCountry && matchesAgeMin && matchesAgeMax;
        });
    };

    // 🎯 Функция для получения отсортированных данных
    const getSortedUsers = () => {
        const filteredUsers = getFilteredUsers();
        
        if (sortConfig.direction === 'none' || !sortConfig.field) {
            return filteredUsers;
        }

        return [...filteredUsers].sort((a, b) => {
            let aValue = getFieldValue(a, sortConfig.field);
            let bValue = getFieldValue(b, sortConfig.field);

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    // 🎯 Функция для получения данных текущей страницы
    const getPaginatedUsers = () => {
        const sortedUsers = getSortedUsers();
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        
        return sortedUsers.slice(startIndex, endIndex);
    };

    // 🎯 Расчет общего количества страниц
    const getTotalPages = () => {
        const totalItems = getFilteredUsers().length;
        return Math.ceil(totalItems / pagination.itemsPerPage);
    };

    // 🎯 Функция для извлечения значения поля
    const getFieldValue = (user, field) => {
        switch (field) {
            case 'fullName':
                return `${user.lastName} ${user.firstName}`;
            case 'lastName':
                return user.lastName || '';
            case 'firstName':
                return user.firstName || '';
            case 'middleName':
                return user.maidenName || '';
            case 'age':
                return user.age || 0;
            case 'gender':
                return user.gender || '';
            case 'phone':
                return user.phone || '';
            case 'email':
                return user.email || '';
            case 'country':
                return user.address?.country || '';
            case 'city':
                return user.address?.city || '';
            default:
                return '';
        }
    };

    // 🎯 Функция для отображения индикатора сортировки
    const getSortIndicator = (field) => {
        if (sortConfig.field !== field) {
            return <span className="sort-indicator none">↕</span>;
        }
        
        switch (sortConfig.direction) {
            case 'asc':
                return <span className="sort-indicator asc">↑</span>;
            case 'desc':
                return <span className="sort-indicator desc">↓</span>;
            default:
                return <span className="sort-indicator none">↕</span>;
        }
    };

    // 🎯 Обработчики изменения фильтров
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // 🎯 Сброс всех фильтров
    const clearFilters = () => {
        setFilters({
            search: '',
            gender: '',
            country: '',
            ageMin: '',
            ageMax: ''
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // 🎯 Обработчики пагинации
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (itemsPerPage) => {
        setPagination({
            currentPage: 1,
            itemsPerPage: parseInt(itemsPerPage)
        });
    };

    // 🎯 Обработчики модального окна
    const handleUserClick = (user) => {
        setModal({
            isOpen: true,
            selectedUser: user
        });
    };

    const handleModalClose = () => {
        setModal({
            isOpen: false,
            selectedUser: null
        });
    };

    // 🎯 Получение уникальных стран для dropdown
    const getUniqueCountries = () => {
        const countries = users.map(user => user.address?.country).filter(Boolean);
        return [...new Set(countries)].sort();
    };

    // 🎯 Компонент заголовка с сортировкой
    const SortableHeader = ({ field, children, sortable = true }) => (
        <th 
            onClick={sortable ? () => handleSort(field) : undefined}
            style={{ cursor: sortable ? 'pointer' : 'default' }}
        >
            <div className="sort-header">
                <span>{children}</span>
                {sortable && getSortIndicator(field)}
            </div>
        </th>
    );

    // 🎯 Компонент пагинации
    const Pagination = () => {
        const totalPages = getTotalPages();
        const currentPage = pagination.currentPage;
        
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 7;
            
            if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentPage <= 4) {
                    for (let i = 1; i <= 5; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 3) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                }
            }
            
            return pages;
        };

        return (
            <div className="pagination-container">
                <div className="pagination-info">
                    <span>
                        Записи {(currentPage - 1) * pagination.itemsPerPage + 1}-
                        {Math.min(currentPage * pagination.itemsPerPage, getFilteredUsers().length)} из {getFilteredUsers().length}
                    </span>
                </div>
                
                <div className="pagination-controls">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        ←
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={index} className="pagination-ellipsis">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                    
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        →
                    </button>
                </div>
                
                <div className="items-per-page">
                    <label>На странице:</label>
                    <select 
                        value={pagination.itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                        className="items-per-page-select"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading-message">Загрузка пользователей...</div>;
    }

    if (error) {
        return <div className="error-message">Ошибка: {error}</div>;
    }

    const paginatedUsers = getPaginatedUsers();
    const filteredCount = getFilteredUsers().length;

    return (
        <div>
            <h2>Таблица пользователей ({filteredCount} из {users.length})</h2>
            
            {/* 🎯 Подсказка для пользователя */}
            <p className="table-hint">
                💡 Нажмите на строку таблицы, чтобы посмотреть подробную информацию о пользователе
            </p>
            
            {/* 🎯 Панель фильтров */}
            <div className="filters-panel">
                <div className="filters-row">
                    <div className="filter-group">
                        <label>Поиск:</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Имя, фамилия, email, телефон, город..."
                            className="filter-input"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Пол:</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Страна:</label>
                        <select
                            value={filters.country}
                            onChange={(e) => handleFilterChange('country', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Все страны</option>
                            {getUniqueCountries().map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="filters-row">
                    <div className="filter-group">
                        <label>Возраст от:</label>
                        <input
                            type="number"
                            value={filters.ageMin}
                            onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                            placeholder="18"
                            className="filter-input-small"
                            min="0"
                            max="100"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>до:</label>
                        <input
                            type="number"
                            value={filters.ageMax}
                            onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                            placeholder="65"
                            className="filter-input-small"
                            min="0"
                            max="100"
                        />
                    </div>
                    
                    <button 
                        onClick={clearFilters}
                        className="clear-filters-btn"
                        title="Сбросить все фильтры"
                    >
                        Сбросить фильтры
                    </button>
                </div>
            </div>
            
            <Pagination />
            
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <SortableHeader field="lastName">Фамилия</SortableHeader>
                            <SortableHeader field="firstName">Имя</SortableHeader>
                            <SortableHeader field="middleName">Отчество</SortableHeader>
                            <SortableHeader field="age">Возраст</SortableHeader>
                            <SortableHeader field="gender">Пол</SortableHeader>
                            <SortableHeader field="phone">Телефон</SortableHeader>
                            <SortableHeader field="email" sortable={false}>Email</SortableHeader>
                            <SortableHeader field="country" sortable={false}>Страна</SortableHeader>
                            <SortableHeader field="city" sortable={false}>Город</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
                            <tr 
                                key={user.id}
                                onClick={() => handleUserClick(user)}
                                className="user-row"
                                title="Нажмите для просмотра подробной информации"
                            >
                                <td>{user.lastName}</td>
                                <td>{user.firstName}</td>
                                <td>{user.maidenName || '—'}</td>
                                <td>{user.age}</td>
                                <td>{user.gender === 'male' ? 'М' : 'Ж'}</td>
                                <td>{user.phone}</td>
                                <td>{user.email}</td>
                                <td>{user.address?.country || '—'}</td>
                                <td>{user.address?.city || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination />

            {/* 🎯 Информация о текущем состоянии */}
            <div className="table-info">
                {sortConfig.field && sortConfig.direction !== 'none' && (
                    <p>
                        Сортировка по полю "{sortConfig.field}" 
                        ({sortConfig.direction === 'asc' ? 'по возрастанию' : 'по убыванию'})
                    </p>
                )}
                
                {filteredCount === 0 && users.length > 0 && (
                    <p style={{color: '#ff6b6b'}}>Не найдено записей по заданным критериям</p>
                )}
            </div>

            {/* 🎯 Модальное окно */}
            <UserModal 
                user={modal.selectedUser}
                isOpen={modal.isOpen}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default UserTable;