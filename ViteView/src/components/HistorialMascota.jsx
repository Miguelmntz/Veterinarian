import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNotesMedical, faSave, faTrashAlt, faFilePdf, faImage, faFileMedicalAlt, faTimes, faPills, faFileInvoiceDollar, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const HistorialMascota = ({ isOpen, onClose, pet, currentUser }) => {
    // Estado de registros del historial clínico
    const [records, setRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const isClient = currentUser?.role === 'client';

    // Variables de estado para integración de consumo de inventario
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');

    // Estados para el formulario de Nueva Consulta
    const [title, setTitle] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [attachment, setAttachment] = useState(null); // Referencia al archivo físico adjunto

    useEffect(() => {
        if (isOpen && pet) {
            fetchRecords();
            fetchAppointments();
            fetchProducts();
            // Reinicio del estado del formulario al cambiar de paciente
            setTitle('');
            setDiagnosis('');
            setTreatment('');
            setAttachment(null);
            setSelectedProductId('');
        }
    }, [isOpen, pet]);

    // Obtención de productos disponibles en inventario
    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            // Filtrado de productos por disponibilidad de stock positivo
            setProducts(res.data.filter(p => p.stock_quantity > 0));
        } catch (error) {
            console.error("Error cargando medicinas para cruzar historial", error);
        }
    };

    // Recuperación de eventos del calendario asociados a la mascota
    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments');
            // Filtrado local de eventos por identificador de mascota
            setAppointments(res.data.filter(a => a.pet_id === (pet.id || pet._id)));
        } catch (error) {
            console.error("Error obteniendo citas en el historial", error);
        }
    };

    // Recuperación del historial clínico filtrado por paciente
    const fetchRecords = () => {
        setLoading(true);
        api.get(`/medical-records?pet_id=${pet.id || pet._id}`)
            .then(res => {
                setRecords(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No pude cargar el historial de la mascota.' });
                setLoading(false);
            });
    };

    // Procedimiento de almacenamiento de nuevo diagnóstico
    const handleSaveRecord = async (e) => {
        e.preventDefault();

        // Preparación de payload en formato FormData para permitir envío de archivos binarios
        // Inclusión de documento adjunto en la petición
        const formData = new FormData();
        formData.append('pet_id', pet.id || pet._id);
        formData.append('symptom_title', title);
        if (diagnosis) formData.append('diagnosis', diagnosis);
        if (treatment) formData.append('treatment', treatment);
        if (attachment) formData.append('attachment', attachment);
        if (selectedProductId) formData.append('product_id', selectedProductId); // Asociación de producto consumido para deducción automática de inventario

        try {
            await api.post('/medical-records', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Declaración de tipo de contenido multipart para soporte de archivos
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Consulta registrada y guardada en el historial'
            });

            // Actualización del estado local para reflejar la nueva consulta
            fetchRecords();
            setTitle('');
            setDiagnosis('');
            setTreatment('');
            setAttachment(null);
            setSelectedProductId('');

            // Cerrar la modal tras el éxito para una mejor experiencia de usuario
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un problema al guardar la consulta médica.' });
        }
    };

    // Procedimiento de eliminación de registro médico y archivos asociados
    const handleDeleteRecord = async (recordId) => {
        const confirmResult = await Swal.fire({
            title: '¿Eliminar consulta?',
            text: "Se borrará también su radiografía o archivo asociado si lo tenía. No se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmResult.isConfirmed) {
            try {
                await api.delete(`/medical-records/${recordId}`);
                Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Consulta y sus archivos eliminados del servidor en Laravel.' });
                // Actualización optimista de la UI eliminando el registro localmente
                setRecords(records.filter(r => r.id !== recordId));
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al intentar eliminar el registro.' });
            }
        }
    };

    // Función auxiliar para renderizar enlaces a documentos adjuntos en almacenamiento público
    const renderAttachmentLink = (record) => {
        if (!record.attachment_path) return null;

        const isPdf = record.attachment_type?.includes('pdf');
        // Resolución de ruta absoluta al servidor backend para acceso a recursos estáticos
        const fileUrl = `https://veterinaria.martinezyelamosabogados.es/storage/${record.attachment_path}`;

        return (
            <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
            >
                <FontAwesomeIcon icon={isPdf ? faFilePdf : faImage} />
                {isPdf ? 'Ver Documento PDF' : 'Ver Radiografía / Imagen'}
            </a>
        );
    };

    if (!isOpen || !pet) return null; // Evitar renderizado si el componente no es invocado

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 h-full">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Cabecera general */}
                <div className="bg-indigo-700 text-white p-5 flex justify-between items-center shadow-md z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <FontAwesomeIcon icon={faNotesMedical} size="lg" /> Historial Clínico de {pet.name} (<span className="text-indigo-200">{pet.species}</span>)
                    </h2>
                    <button onClick={onClose} className="text-indigo-200 hover:text-white transition cursor-pointer p-2">
                        <FontAwesomeIcon icon={faTimes} size="xl" />
                    </button>
                </div>

                {/* Disposición del diseño: visor de historial (izq) y formulario de creación (der, condicional) */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                    {/* IZQUIERDA: Visor de Historial Scrolleable */}
                    <div className={`w-full ${!isClient ? 'md:w-3/5 border-r border-gray-200' : ''} p-6 bg-gray-50 overflow-y-auto custom-scrollbar`}>
                        <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-3 mb-5 flex items-center gap-2">
                            <FontAwesomeIcon icon={faFileMedicalAlt} className="text-indigo-500" /> Cronología de la Mascota
                        </h3>

                        {loading ? (
                            <p className="text-gray-500 italic p-4">Cargando datos desde la API...</p>
                        ) : records.length === 0 && appointments.length === 0 ? (
                            <div className="text-center p-10 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                                <FontAwesomeIcon icon={faNotesMedical} size="3x" className="mb-4 text-gray-200" />
                                <p>El historial y el calendario están completamente en blanco por ahora.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pr-2">
                                {/* Concatenación y ordenación combinada de citas y consultas médicas por fecha */}
                                {[
                                    ...records.map(r => ({ ...r, type: 'record', dateStr: r.created_at })),
                                    ...appointments
                                        .filter(a => !records.some(r => r.symptom_title === `Consulta de la cita: ${a.title}`))
                                        .map(a => ({ ...a, type: 'appointment', dateStr: a.start_time }))
                                ].sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr)).map(item => {

                                    if (item.type === 'appointment') {
                                        return (
                                            <div key={`app-${item.id}`} className="bg-blue-50/50 p-5 rounded-xl border border-blue-200 shadow-sm relative transition hover:shadow-md">
                                                <p className="text-xs font-black text-blue-500 mb-1 tracking-widest flex justify-between items-center">
                                                    <span className="uppercase flex items-center gap-2"><FontAwesomeIcon icon={faCalendarAlt} /> Cita de Calendario</span>
                                                    <span className="text-blue-400 font-bold normal-case bg-blue-100 px-2 py-0.5 rounded-full">
                                                        {new Date(item.start_time).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </p>
                                                <h4 className="text-lg font-bold text-gray-800 my-2">{item.title}</h4>
                                                {item.notes && <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded border border-blue-100">{item.notes}</p>}
                                                {!isClient && (
                                                    <button
                                                        onClick={() => setTitle(`Consulta de la cita: ${item.title}`)}
                                                        className="w-full mt-1 text-xs font-bold text-blue-700 bg-white border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm"
                                                    >
                                                        <FontAwesomeIcon icon={faNotesMedical} /> Redactar informe médico de esta visita
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Renderizado estándar de entrada de historial clínico
                                    return (
                                        <div key={`rec-${item.id}`} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative group hover:shadow-md transition">
                                            {!isClient && (
                                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => handleDeleteRecord(item.id)}
                                                        className="text-red-300 hover:text-red-500 transition ml-2 h-8 w-8 flex items-center justify-center"
                                                        title="Eliminar registro médico"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </button>
                                                </div>
                                            )}

                                            <p className="text-xs font-black text-indigo-400 mb-1 uppercase tracking-widest">
                                                {/* Formateo de fecha ISO 8601 a representación local */}
                                                {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <h4 className="text-xl font-bold text-gray-800 mb-4">{item.symptom_title}</h4>

                                            {item.diagnosis && (
                                                <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1 mb-1">
                                                        Evaluación y Diagnóstico
                                                    </span>
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{item.diagnosis}</p>
                                                </div>
                                            )}
                                            {item.treatment && (
                                                <div className="mt-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                                                    <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider mb-1 block">
                                                        Tratamiento y Medicación
                                                    </span>
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{item.treatment}</p>
                                                </div>
                                            )}

                                            {item.product && (
                                                <div className="mt-3 flex items-center gap-2 bg-orange-50 text-orange-700 p-2 rounded-lg border border-orange-100 shadow-sm w-fit">
                                                    <FontAwesomeIcon icon={faPills} className="text-orange-500" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Descontado del Inventario:</span>
                                                    <span className="text-xs font-black">{item.product.name}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {renderAttachmentLink(item)}

                                                <a
                                                    href={`https://veterinaria.martinezyelamosabogados.es/api/invoices/${item.id}/download`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 border border-green-200 transition"
                                                >
                                                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                                                    Factura (PDF)
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Zona de creación de registros (Acceso restringido) */}
                    {!isClient && (
                        <div className="w-full md:w-2/5 p-6 bg-white overflow-y-auto">
                            <h3 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-5 flex items-center gap-2">
                                <FontAwesomeIcon icon={faNotesMedical} /> Redactar Consulta
                            </h3>
                            <form onSubmit={handleSaveRecord} className="flex flex-col gap-5">

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Motivo (Título de Visita)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Revisión por cuadro de vómitos..."
                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Desarrollo y Diagnóstico</label>
                                    <textarea
                                        placeholder="Descripción de la consulta..."
                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 min-h-[120px] text-sm"
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Receta / Tratamiento Administrado</label>
                                    <textarea
                                        placeholder="Ej: Toma de 1 pastilla cada 8 horas durante 2 semanas..."
                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 min-h-[90px] text-sm"
                                        value={treatment}
                                        onChange={(e) => setTreatment(e.target.value)}
                                    />
                                </div>

                                {/* Módulo de integración de consumo de inventario */}
                                <div className="flex flex-col gap-1 mt-1 bg-orange-50/30 p-3 rounded-xl border border-orange-100">
                                    <label className="text-xs font-bold text-orange-700 uppercase tracking-wide flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPills} /> Aplicar Medicina al Paciente
                                    </label>
                                    <p className="text-[10px] text-orange-500 mb-1 leading-tight">Si seleccionas una medicina, se le restará <span className="font-bold">1 unidad</span> al stock principal automáticamente al guardar todo.</p>
                                    <select
                                        className="p-3 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-sm font-bold text-gray-700 cursor-pointer"
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                    >
                                        <option value="">-- No se ha gastado material  --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Quedan {p.stock_quantity} unidades)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Interfaz de carga de documentos adjuntos */}
                                <div className="flex flex-col gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl mt-2 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full"></div>
                                    <label className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faImage} /> Archivo Audiovisual Complementario
                                    </label>
                                    <p className="text-xs text-indigo-500 mb-2 leading-tight">Obligatorio si se practicó una radiografía. Es compatible subir su formato de imagen `.png/.jpg/.jpeg/.webp` nativo o informes pasados a `.pdf`. El límite de los archivos es de 10 MB.</p>
                                    <input
                                        type="file"
                                        id="file-upload" // Identificador necesario para posible reseteo manual del input en el DOM
                                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                                        onChange={(e) => setAttachment(e.target.files[0])}
                                        className="text-xs text-gray-500 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-indigo-200 file:text-xs file:font-extrabold file:bg-white file:text-indigo-600 hover:file:bg-indigo-600 hover:file:text-white transition-all w-full"
                                    />
                                </div>

                                <button type="submit" className="mt-4 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-95">
                                    <FontAwesomeIcon icon={faSave} /> Dejar Constancia Médica
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default HistorialMascota;
