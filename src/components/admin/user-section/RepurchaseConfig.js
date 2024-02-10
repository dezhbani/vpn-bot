import React, { useState } from 'react';
import styles from './RepurchaseConfig.module.css';
import Modal from '../../public/components/Modal';
import { activeConfig } from '../../services/config.service';
import { repurchase } from '../../services/users.service';
import Config from '../public/Config';

const RepurchaseConfig = ({open, setOpen, userID}) => {
    const [configs, setConfigs] = useState([]);
    const [selected, setSelected] = useState([]);
    const handleClose = () => setOpen(false);
    const repurchaseHandler = async () => {
        const { list } = await activeConfig(userID);
        if (list.length > 1) {
            configs.length == 0 && setConfigs(list);
        } else {
            console.log(list);
            repurchase(userID, list[0].configID)
            handleClose()
        }
    }
    const send = () => {
        selected.map(configID => repurchase(userID, configID))
    }
    if(open) repurchaseHandler();

    if (configs.length > 1) return (
        <Modal isOpen={open} onClose={handleClose}>
            <h4 className={styles.help}>روی کانفیگ مورد نظرت کلیک کن</h4>
            <div>
                {
                    configs.map(config => <Config config={config} selected={selected} setSelected={setSelected} />)
                }
            </div>
            <div className={styles.buttonContainer}>
                {
                    selected.length > 0 && <button onClick={send}>تمدید</button>
                }
            </div>
        </Modal>
    );
};

export default RepurchaseConfig;