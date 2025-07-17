import React from 'react';

const UserModal = ({ user, isOpen, onClose }) => {
    // 🎯 Обработчик ESC - ВАЖНО: хуки должны быть ДО раннего возврата!
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Блокируем прокрутку страницы
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // 🎯 Ранний возврат ПОСЛЕ всех хуков
    if (!isOpen || !user) return null;

    // 🎯 Обработчик закрытия по клику на backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 🎯 Функция для форматирования адреса
    const formatAddress = (address) => {
        if (!address) return 'Не указан';
        
        const parts = [
            address.address,
            address.city,
            address.state,
            address.country,
            address.postalCode
        ].filter(Boolean);
        
        return parts.length > 0 ? parts.join(', ') : 'Не указан';
    };

    // 🎯 Функция для форматирования координат
    const formatCoordinates = (coordinates) => {
        if (!coordinates || !coordinates.lat || !coordinates.lng) return null;
        return `${coordinates.lat}, ${coordinates.lng}`;
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                {/* 🎯 Заголовок модального окна */}
                <div className="modal-header">
                    <h2>Информация о пользователе</h2>
                    <button 
                        className="modal-close-btn"
                        onClick={onClose}
                        title="Закрыть"
                    >
                        ×
                    </button>
                </div>

                {/* 🎯 Тело модального окна */}
                <div className="modal-body">
                    {/* 🎯 Основная информация с аватаром */}
                    <div className="user-main-info">
                        <div className="user-avatar">
                            <img 
                                src={user.image} 
                                alt={`${user.firstName} ${user.lastName}`}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2196F3&color=fff&size=120`;
                                }}
                            />
                        </div>
                        
                        <div className="user-basic-info">
                            <h3>{user.firstName} {user.lastName}</h3>
                            {user.maidenName && (
                                <p className="maiden-name">Девичья фамилия: {user.maidenName}</p>
                            )}
                            <div className="info-badges">
                                <span className="info-badge age">{user.age} лет</span>
                                <span className="info-badge gender">
                                    {user.gender === 'male' ? 'Мужчина' : 'Женщина'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 🎯 Детальная информация в виде карточек */}
                    <div className="user-details-grid">
                        {/* Контакты */}
                        <div className="detail-card">
                            <h4>Контактная информация</h4>
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">
                                    <a href={`mailto:${user.email}`}>{user.email}</a>
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Телефон:</span>
                                <span className="detail-value">
                                    <a href={`tel:${user.phone}`}>{user.phone}</a>
                                </span>
                            </div>
                            {user.university && (
                                <div className="detail-item">
                                    <span className="detail-label">Университет:</span>
                                    <span className="detail-value">{user.university}</span>
                                </div>
                            )}
                        </div>

                        {/* Физические данные */}
                        <div className="detail-card">
                            <h4>Физические данные</h4>
                            <div className="detail-item">
                                <span className="detail-label">Рост:</span>
                                <span className="detail-value">{user.height} см</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Вес:</span>
                                <span className="detail-value">{user.weight} кг</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Группа крови:</span>
                                <span className="detail-value">{user.bloodGroup || 'Не указана'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Цвет глаз:</span>
                                <span className="detail-value">{user.eyeColor || 'Не указан'}</span>
                            </div>
                        </div>

                        {/* Адрес */}
                        <div className="detail-card address-card">
                            <h4>Адрес проживания</h4>
                            <div className="detail-item">
                                <span className="detail-label">Полный адрес:</span>
                                <span className="detail-value address-text">
                                    {formatAddress(user.address)}
                                </span>
                            </div>
                            {formatCoordinates(user.address?.coordinates) && (
                                <div className="detail-item">
                                    <span className="detail-label">Координаты:</span>
                                    <span className="detail-value">
                                        {formatCoordinates(user.address.coordinates)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Профессиональная информация */}
                        {(user.company || user.department || user.title) && (
                            <div className="detail-card">
                                <h4>Работа</h4>
                                {user.company?.name && (
                                    <div className="detail-item">
                                        <span className="detail-label">Компания:</span>
                                        <span className="detail-value">{user.company.name}</span>
                                    </div>
                                )}
                                {user.company?.department && (
                                    <div className="detail-item">
                                        <span className="detail-label">Отдел:</span>
                                        <span className="detail-value">{user.company.department}</span>
                                    </div>
                                )}
                                {user.company?.title && (
                                    <div className="detail-item">
                                        <span className="detail-label">Должность:</span>
                                        <span className="detail-value">{user.company.title}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Дополнительная информация */}
                        <div className="detail-card">
                            <h4>Дополнительно</h4>
                            <div className="detail-item">
                                <span className="detail-label">Дата рождения:</span>
                                <span className="detail-value">
                                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : 'Не указана'}
                                </span>
                            </div>
                            {user.ssn && (
                                <div className="detail-item">
                                    <span className="detail-label">SSN:</span>
                                    <span className="detail-value">{user.ssn}</span>
                                </div>
                            )}
                            {user.ein && (
                                <div className="detail-item">
                                    <span className="detail-label">EIN:</span>
                                    <span className="detail-value">{user.ein}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🎯 Подвал модального окна */}
                <div className="modal-footer">
                    <button 
                        className="modal-action-btn secondary"
                        onClick={onClose}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal; 