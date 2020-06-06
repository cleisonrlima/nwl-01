import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../.././services/api';
import Dropzone from '../../components/Dropzone/index';
import axios from 'axios';


import logo from '../../assets/logo.svg';
import './styles.css';

interface Item {
    id: number,
    title: string,
    image_url: string;
}


interface IBGEUFResponse {
    sigla: string,
}

interface IBGECityResponse {
    nome: string,
}

const CreatePoint: React.FC = () => {
    const history = useHistory();
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    const [ufSelected, setUfSelected] = useState<string>('0');
    const [citySelected, setCitySelected] = useState<string>('0');
    const [positionSelected, setPositionSelected] = useState<[number, number]>([0, 0]);
    const [itemsSelected, setItemsSelected] = useState<number[]>([]);
    const [fileSelected, setFileSelected] = useState<File>();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setPositionSelected([latitude, longitude]);
        })
    }, [])

    useEffect(() => {
        async function loadItems() {
            const resp = await api.get('/items');
            setItems(resp.data);
        }
        loadItems();
    }, [])

    useEffect(() => {
        async function loadUfs() {
            const resp = await axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
            const ufCodes = resp.data.map(uf => uf.sigla);
            setUfs(ufCodes);
        }
        loadUfs();
    }, [])

    useEffect(() => {
        async function loadCities() {
            const resp = await axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelected}/municipios`);
            const cityNames = resp.data.map(city => city.nome);
            setCities(cityNames);
        }
        if (ufSelected !== '0') {
            loadCities();
        }

    }, [ufSelected])

    function handleMapClick(event: LeafletMouseEvent) {
        setPositionSelected([event.latlng.lat, event.latlng.lng]);

    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    function handleItemsSelected(id: number) {
        const alreadySelected = itemsSelected.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filtedItems = itemsSelected.filter(item => item !== id);
            setItemsSelected(filtedItems);
        } else {
            setItemsSelected([...itemsSelected, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {

        event.preventDefault();
        const { name, email, whatsapp } = formData;
        const uf = ufSelected;
        const city = citySelected;
        const [latitude, longitude] = positionSelected;
        const items = itemsSelected;

        console.log(formData);


        const dataToPost = new FormData();

        dataToPost.append('name', name);
        dataToPost.append('email', email);
        dataToPost.append('whatsapp', whatsapp);
        dataToPost.append('uf', uf);
        dataToPost.append('city', city);
        dataToPost.append('latitude', String(latitude));
        dataToPost.append('longitude', String(longitude));
        dataToPost.append('items', items.join(','));

        if (fileSelected) {
            dataToPost.append('image', fileSelected);
        }

        const resp = await api.post('points', dataToPost).catch(error => error.response);

        if (resp.data.error) {
            alert(resp.data.message);
            
        } else {
            alert('dados cadastrados com sucesso');
            history.push('/');
        }






    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
              Voltar para home
          </Link>
            </header>
            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br />ponto de coleta</h1>
                <Dropzone onFileOpuloaded={setFileSelected} />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">whatsapp</label>
                            <input type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereco</h2>
                        <span>Selecione o endereco no mapa</span>
                    </legend>
                    <Map center={positionSelected} zoom={18.26} onclick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={positionSelected} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                onChange={(event: ChangeEvent<HTMLSelectElement>) => setUfSelected(event.target.value)}
                                value={ufSelected}
                            >
                                <option value="0" >Selecione um UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf} >{uf}</option>
                                ))}

                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={citySelected}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) => setCitySelected(event.target.value)}
                            >

                                <option value="0" >Selecione uma Cidade</option>
                                {cities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais items abaixo</span>
                    </legend>

                </fieldset>

                <ul className="items-grid">
                    {items.map(item => (
                        <li key={item.id} className={itemsSelected.includes(item.id) ? 'selected' : ''} onClick={() => handleItemsSelected(item.id)} >
                            <img src={item.image_url} alt={item.title} />
                            <span>{item.title}</span>
                        </li>
                    ))}



                </ul>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>

        </div>
    )
}

export default CreatePoint