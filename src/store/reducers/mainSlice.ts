import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { warn } from 'console';
// import { VideoState } from './videoSlice';
import { VideoState, VideoUpdatePayload } from './videoSlice';


export enum WarningKey {
  DATETIME = 'datetime',
  FORMAT = 'format',
  OVERTIME = 'overtime',
  OTHER = 'other',
}

export interface HistoryWarning {
  id: string,
  src: number,
  key: WarningKey,
  flexible: number,
  digits: string[],
  time: number,
}

export interface MainState {
  session: string;
  status: string;
  srcToShow: number;
  history: HistoryWarning[];
  history2: HistoryWarning[];
}

const initialState: MainState = {
  session: '',
  status: '',
  srcToShow: 1,
  history: [],
  history2: [],
};


export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    refreshHistory: (state, action: PayloadAction<HistoryWarning[]>) => {
      // console.log('refreshHistory action: ', action)
      const payload = action.payload;
      const src1Warnings : HistoryWarning[] = [];
      const src2Warnings : HistoryWarning[] = [];
      payload.forEach((val:HistoryWarning) => {
        if(val.src === 1) {
          src1Warnings.push(val);
        }
        else {
          src2Warnings.push(val);
        }
      })
      state.history = src1Warnings;
      state.history2 = src2Warnings;
    },
    addHistroyByVideos: (state, action: PayloadAction<VideoUpdatePayload>) => {
      // console.log('addHistroy action: ', action)
      const payload = action.payload;
      const newWarnings : HistoryWarning[] = [];
      const newWarnings2 : HistoryWarning[] = [];

      if(payload) {
        const { addrUpdateCount, addr2UpdateCount, vdata } = payload;
        
        vdata.forEach((val:any) => {
          Object.keys(val.warning).forEach(key => {
            if (val.warning[key]) {
              // console.log('val: ', val);
              const newHistory : HistoryWarning = {
                id: val.id,
                src: val.src,
                key: key as WarningKey,
                flexible: val['minute_flexible'],
                digits: val['parsed_digits'],
                time: val['last_timestamp'],
              }
              if(val.src === 1) {
                newWarnings.push(newHistory);
              }
              else {
                newWarnings2.push(newHistory);
              }
            }
          })
        })
      }

      if (newWarnings.length > 0) {
        const sliceBegin = Math.max(0, state.history.length + newWarnings.length - 50);
        const nextHistories = state.history.slice(sliceBegin);
        state.history = nextHistories.concat(newWarnings);

        newWarnings.forEach((warning: HistoryWarning) => {
          const options: NotificationOptions = {
            body: '',
            dir: 'ltr',
          }
          switch (warning.key) {
            case WarningKey.DATETIME: options.body = `[ ${warning.id} ] [ 來源${warning.src} ] 無法捕捉到平板資訊.`; break;
            case WarningKey.OVERTIME: options.body = `[ ${warning.id} ] [ 來源${warning.src} ] 連續偵測到時間可能延遲.`; break;
            // case WarningKey.FORMAT: options.body = `[ ${warning.id} ] 連續偵測到格式錯誤.`; break;
            default: return;
          }
          const notification = new Notification('Warning of Videos Observer ', options);
        });
      }

      if (newWarnings2.length > 0) {
        const sliceBegin = Math.max(0, state.history2.length + newWarnings2.length - 50);
        const nextHistories = state.history2.slice(sliceBegin);
        state.history2 = nextHistories.concat(newWarnings2);

        newWarnings2.forEach((warning: HistoryWarning) => {
          const options: NotificationOptions = {
            body: '',
            dir: 'ltr',
          }
          switch (warning.key) {
            case WarningKey.DATETIME: options.body = `[ ${warning.id} ] [ 來源${warning.src} ] 無法捕捉到平板資訊.`; break;
            case WarningKey.OVERTIME: options.body = `[ ${warning.id} ] [ 來源${warning.src} ] 連續偵測到時間可能延遲.`; break;
            // case WarningKey.FORMAT: options.body = `[ ${warning.id} ] 連續偵測到格式錯誤.`; break;
            default: return;
          }
          const notification = new Notification('Warning of Videos Observer ', options);
        });
      }

      return state
    },
    switchHistoriesToShow: (state) => {
      const ori_source = state.srcToShow;
      console.log('switchHistoriesToShow source before switch: ', ori_source)
      state.srcToShow = ori_source === 1 ? 2 : 1;
      console.log('switchHistoriesToShow source after switch: ', state.srcToShow)
    }
  },
});

export const { refreshHistory, addHistroyByVideos, switchHistoriesToShow } = mainSlice.actions;

export const mainData = (state: RootState) => state.main;
export const mainHistories = (state: RootState) => state.main.srcToShow === 1 ? state.main.history: state.main.history2;


export default mainSlice.reducer;
