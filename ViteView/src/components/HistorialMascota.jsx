import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNotesMedical, faSave, faTrashAlt, faFilePdf, faImage, faFileMedicalAlt, faTimes, faPills } from '@fortawesome/free-solid-svg-icons';

const HistorialMascota = ({ isOpen, onClose, pet }) => {
    // Array donde guardaré todo el historial que me devuelva Laravel
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados adicionales para la Integración con el Inventario (Módulo del Almacén)
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');

    // Estados para el formulario de Nueva Consulta
    const [title, setTitle] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [attachment, setAttachment] = useState(null); // Aquí se guarda el archivo físico

    useEffect(() => {
        if (isOpen && pet) {
            fetchRecords();
            fetchProducts();
            // Limpio el form visualmente para que si cierro la modal de un paciente y abro otra, no se quede mi texto anterior colgado
            setTitle('');
            setDiagnosis('');
            setTreatment('');
            setAttachment(null);
            setSelectedProductId('');
        }
    }, [isOpen, pet]);

    // Rescato las medicinas que hay físicas en la cristalera para meterlas en el select
    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/products');
            // Filto a lo bruto para mostrar solo las que tienen más de 0 unidades físicas. No puedo inyectar vacío
            setProducts(res.data.filter(p => p.stock_quantity > 0)); 
        } catch (error) {
            console.error("Error cargando medicinas para cruzar historial", error);
        }
    };

    // Función que llama a la DB filtrando las consultas solo de este paciente
    const fetchRecords = () => {
        setLoading(true);
        axios.get(`http://localhost:8000/api/medical-records?pet_id=${pet.id || pet._id}`)
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

    // Al guardar un diagnóstico nuevo
    const handleSaveRecord = async (e) => {
        e.preventDefault();

        // Como estoy subiendo un archivo (fichero real), no puedo mandar un JSON normalito por Axios.
        // Tengo que montar un FormData nativo de HTML que empaquete todo, incluida la foto/pdf.
        const formData = new FormData();
        formData.append('pet_id', pet.id || pet._id);
        formData.append('symptom_title', title);
        if (diagnosis) formData.append('diagnosis', diagnosis);
        if (treatment) formData.append('treatment', treatment);
        if (attachment) formData.append('attachment', attachment);
        if (selectedProductId) formData.append('product_id', selectedProductId); // Integración brutal con stock

        try {
            await axios.post('http://localhost:8000/api/medical-records', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Cabecera hiper clave para que el backend reconozca ficheros file[]
                }
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Consulta registrada y guardada en el historial'
            });

            // Recargo el array de consultas para que el veterinario vea la que acaba de escribir
            fetchRecords();
            setTitle('');
            setDiagnosis('');
            setTreatment('');
            setAttachment(null);
            setSelectedProductId('');
            document.getElementById('file-upload').value = ""; // Truco barato de JS plano para resetear visualmente el input name de archivo de Windows

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un problema al guardar la consulta médica.' });
        }
    };

    // Para fulminar una consulta médica de un flechazo
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
                await axios.delete(`http://localhost:8000/api/medical-records/${recordId}`);
                Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Consulta y sus archivos eliminados del servidor en Laravel.' });
                // Filtro el array local para limpiarlo sin forzar una petición GET redundante
                setRecords(records.filter(r => r.id !== recordId));
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al intentar eliminar el registro.' });
            }
        }
    };

    // Helper chulo para pintar un botón muy guapo si hay archivo, usando el localhost local 8000 para pescar en 'storage'
    const renderAttachmentLink = (record) => {
        if (!record.attachment_path) return null;

        const isPdf = record.attachment_type?.includes('pdf');
        // Obligatorio llamar al puerto de Laravel (8000) porque Vite va por el 5173 e ignoraría el storage público de public/storage
        const fileUrl = `http://localhost:8000/storage/${record.attachment_path}`;

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

    if (!isOpen || !pet) return null; // Componente vacío e invisible falso si no se le llama explícitamente

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

                {/* El layout tipo Grid partido: la izq el historial bajando en scroll, la derecha siempre visible el creador */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    
                    {/* IZQUIERDA: Visor de Historial Scrolleable */}
                    <div className="w-full md:w-3/5 p-6 bg-gray-50 overflow-y-auto border-r border-gray-200 custom-scrollbar">
                        <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-3 mb-5 flex items-center gap-2">
                            <FontAwesomeIcon icon={faFileMedicalAlt} className="text-indigo-500" /> Consultas Pasadas Registradas
                        </h3>
                        
                        {loading ? (
                            <p className="text-gray-500 italic p-4">Cargando datos desde la API...</p>
                        ) : records.length === 0 ? (
                            <div className="text-center p-10 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                                <FontAwesomeIcon icon={faNotesMedical} size="3x" className="mb-4 text-gray-200" />
                                <p>El historial médico está completamente en blanco por ahora.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pr-2">
                                {records.map(record => (
                                    <div key={record.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative group hover:shadow-md transition">
                                        <button 
                                            onClick={() => handleDeleteRecord(record.id)}
                                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                            title="Eliminar registro médico"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>

                                        <p className="text-xs font-black text-indigo-400 mb-1 uppercase tracking-widest">
                                            {/* Trucazo: Parseo la fecha de Laravel directo a bonito JS plano en navegador */}
                                            {new Date(record.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                        </p>
                                        <h4 className="text-xl font-bold text-gray-800 mb-4">{record.symptom_title}</h4>
                                        
                                        {record.diagnosis && (
                                            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1 mb-1">
                                                     Evaluación y Diagnóstico
                                                </span>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{record.diagnosis}</p>
                                            </div>
                                        )}
                                        {record.treatment && (
                                            <div className="mt-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                                                <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider mb-1 block">
                                                     Tratamiento y Medicación
                                                </span>
                                                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{record.treatment}</p>
                                            </div>
                                        )}

                                        {record.product && (
                                            <div className="mt-3 flex items-center gap-2 bg-orange-50 text-orange-700 p-2 rounded-lg border border-orange-100 shadow-sm w-fit">
                                                <FontAwesomeIcon icon={faPills} className="text-orange-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-wide">Descontado del Inventario:</span>
                                                <span className="text-xs font-black">{record.product.name}</span>
                                            </div>
                                        )}

                                        {renderAttachmentLink(record)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DERECHA: Zona Creadora de Entradas */}
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
                                    placeholder="Tómate tu tiempo, el textarea puede expandirse infinito mediante saltos de linea..." 
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

                            {/* SELECTOR MÁGICO DEL ALMACÉN */}
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
                                    <option value="">-- No se ha gastado material registrable oficial --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Quedan {p.stock_quantity} unidades)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Zona mágica para arrastrar y subir ficheros */}
                            <div className="flex flex-col gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl mt-2 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full"></div>
                                <label className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faImage} /> Archivo Audiovisual Complementario
                                </label>
                                <p className="text-xs text-indigo-500 mb-2 leading-tight">Obligatorio si se practicó una radiografía. Es compatible subir su formato de imagen `.png/.jpg` nativo o informes pasados a `.pdf`. El límite fijado en Backend es de 10 MB.</p>
                                <input 
                                    type="file"
                                    id="file-upload" // Tuve que ponerle ID a las bravas para machacarlo visualmente limpiando su '.value' manual con JS.
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setAttachment(e.target.files[0])}
                                    className="text-xs text-gray-500 file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-indigo-200 file:text-xs file:font-extrabold file:bg-white file:text-indigo-600 hover:file:bg-indigo-600 hover:file:text-white transition-all w-full"
                                />
                            </div>

                            <button type="submit" className="mt-4 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-95">
                                <FontAwesomeIcon icon={faSave} /> Dejar Constancia Médica
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HistorialMascota;
