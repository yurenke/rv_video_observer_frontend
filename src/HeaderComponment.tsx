import React, {useState, useRef} from 'react';
import './styles/HeaderComponment.scss';

import { useAppSelector, useAppDispatch } from './store/hooks';
import {
    mainData,
    mainHistories,
    WarningKey,
} from './store/reducers/mainSlice';
import {
    videoBasicInfo,
    vStatus,
} from './store/reducers/videoSlice';
import { reloadVideos, switchVideoSource } from './store/index';
// import cnx from "classnames";
import axios from 'axios';
import config from './config';

function HeaderComponment() {
    // const mainAppData = useAppSelector(mainData);
    const histories = useAppSelector(mainHistories);
    const videosInfo = useAppSelector(videoBasicInfo);
    const dispatch = useAppDispatch();
    const refListWarning = useRef<HTMLUListElement>(null);
    const [lockScroll, setLockScroll] = useState(false);
    // console.log('mainAppData: ', mainAppData);
    

    function switchContent(key:string) {
        switch (key) {
            case WarningKey.FORMAT:
                return '連續檢測到錯誤的時間格式'
            case WarningKey.DATETIME:
                return '找不到平板位置'
            case WarningKey.OVERTIME:
                return '超過一分鐘的延遲時間'
            default:
                return '未知'
        }
    }

    function onClickWarning(evt:any, id:string) {
        const domVideo : HTMLElement = document.querySelector(`#video-ranking-${id}`) as HTMLElement;
        domVideo && domVideo.click()
    }

    function onClickReload(evt:any) {
        if (videosInfo.ready) {
            reloadVideos();
        } else {
            window.alert('正在讀取中請稍後.');
        }
    }

    function onClickSwitch(evt:any) {
        if (videosInfo.ready) {
            switchVideoSource();
        } else {
            window.alert('正在讀取中請稍後.');
        }
    }

    const downloadLogs = async () => {
        try {
          const response = await axios.get(`${config.apiUrl}/export-logs`, {
            responseType: 'blob',
          });
    
          // 創建一個 URL 來表示文件 Blob
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'logs.zip');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('下載日志失敗:', error);
        }
      };

    React.useEffect(() => {
        const wDomUlist = refListWarning.current;
        // console.log('mainAppData.history length: ', mainAppData.history.length)
        if (wDomUlist && !lockScroll) {
            const li = wDomUlist.lastElementChild;
            li && li.scrollIntoView({ block: 'end',  behavior: 'smooth' });
        }
        
    }, [histories, lockScroll]);

    return (
        <div className="Header-componment">
            
            <div className="recent-warning">
                <ul className="warning-list" ref={refListWarning} onMouseEnter={() => setLockScroll(true)} onMouseLeave={() => setLockScroll(false)}>
                {
                    histories.map(h => {
                        return (
                            <li className={'warning ' + (h.key)} key={h.id+h.key+h.time} onClick={e => onClickWarning(e, h.id)}>
                                <span className='timestamp'>【{h.time}】</span>
                                <span className='prefix'>{h.id}</span>
                                <span className='prefix'>來源{h.src}</span>
                                <span className='content'>{switchContent(h.key)}</span>
                                <span className='minute'>推測分鐘數為({h.flexible})</span>
                            </li>
                        )
                    })
                }
                </ul>
            </div>
            <div className="controller-observer">
                <table>
                    <tbody>
                        {videosInfo.listToShow === 1 ? (
                            <tr>
                                <td>來源1</td>
                                <td>已連線廳數: {videosInfo.list.filter(e => e.status === vStatus.OPEN).length}</td>
                                <td>總廳數: {videosInfo.list.length}</td>
                            </tr>
                        ) : (
                            <tr>
                                <td>來源2</td>
                                <td>已連線廳數: {videosInfo.list2.filter(e => e.status === vStatus.OPEN).length}</td>
                                <td>總廳數: {videosInfo.list2.length}</td>
                            </tr>
                        )}
                        <tr>
                            <td><button onClick={onClickReload}>重新讀取</button></td>
                            <td><button onClick={onClickSwitch}>切換至視頻來源{videosInfo.listToShow === 1 ? '2' : '1'}</button></td>
                            <td><button onClick={downloadLogs}>下載日誌</button></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default HeaderComponment;