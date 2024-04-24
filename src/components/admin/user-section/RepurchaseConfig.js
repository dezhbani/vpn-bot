import React, { useState } from 'react';
import styles from './RepurchaseConfig.module.css';
import Modal from '../../public/components/Modal';
import { activeConfig } from '../../services/config.service';
import { repurchase } from '../../services/users.service';
import Config from '../public/Config';

const RepurchaseConfig = ({open, setOpen, userID}) => {
    const [configs, setConfigs] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleClose = () => {
        setOpen(false);
        setLoading(false);

    }
    const repurchaseHandler = async () => {
        const result = await activeConfig(userID);
        if(!result) return handleClose()
        const { list } = result;
        if (list.length > 1) {
            configs.length == 0 && setConfigs(list);
        } else {
            repurchase(userID, list[0].configID, handleClose)
        }
    }
    const send = (e) => {
        selected.map(configID => repurchase(userID, configID, handleClose))
        setLoading(true);
        setSelected([])
    }
    if(open) repurchaseHandler();

    return (
        <Modal isOpen={open} onClose={handleClose} loading={!(!loading && configs.length > 0)}>
                    <h4 className={styles.help}>روی کانفیگ مورد نظرت کلیک کن</h4>
                    <div>
                        {
                            configs.map(config => <Config config={config} selected={selected} setSelected={setSelected} />)
                        }
                    </div>
                    <div className={styles.buttonContainer}>
                        {
                            <button onClick={send}>تمدید</button>
                        }
                    </div>
        </Modal>
    )
};

export default RepurchaseConfig;