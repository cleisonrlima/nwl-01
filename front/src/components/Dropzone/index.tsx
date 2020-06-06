import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';


import './styles.css';

interface Props {
    onFileOpuloaded: (file: File) => void;
}


const Dropzone: React.FC<Props> = ({onFileOpuloaded}) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('')

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        const fileUrl = URL.createObjectURL(file);

        setSelectedFileUrl(fileUrl);
        onFileOpuloaded(file);

    }, [onFileOpuloaded])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*'

    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*" />

            {selectedFileUrl
                ? <img src={selectedFileUrl} alt="ponto" />
                : (
                    <p>
                        <FiUpload />
                        Imagem do estabelecimento
                    </p>
                   )
            }




        </div>
    )
}

export default Dropzone;