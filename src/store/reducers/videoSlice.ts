import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, hostAddress } from '../index';



export enum vStatus {
  OPEN = 1,
  CLOSE = 0,
  LOADING = 3,
  FAILED = 4,
}

export interface VideoState {
  id: string,
  status: vStatus,
  src: number,
  img: string,
  minute: number,
  minuteLast: number,
  ontime: boolean,
  wrongs: any,
  warning: any,
  parsedDigits: string[],
  timestamp: number,
}

export interface VideoInfoPayload {
  addrVideos: VideoState[];
  addr2Videos: VideoState[];
}

export interface VideoUpdatePayload {
  addrUpdateCount: number;
  addr2UpdateCount: number;
  vdata: VideoState[];
}

export interface VideoFrameState {
  session: string;
  listToShow: number;
  list: VideoState[];
  list2: VideoState[];
  ready: boolean;
  mapListIndex: any;
  mapListIndex2: any;
}

const initialState: VideoFrameState = {
  session: '',
  listToShow: 1,
  list: [],
  list2: [],
  ready: false,
  mapListIndex: {},
  mapListIndex2: {}
};

const getSortValue = function(vst: vStatus) {
  switch (vst) {
    case vStatus.OPEN:
    case vStatus.LOADING: return 3;
    case vStatus.CLOSE: return 2;
    case vStatus.FAILED: return 1;
    default:
  }
  return 0
}

const sortVideoArray = function(a:VideoState, b:VideoState) {
  const gapVal = getSortValue(b.status) - getSortValue(a.status)
  return gapVal === 0 ? (b.id > a.id ? -1 : 1) : gapVal;
}

export const videoSlice = createSlice({
  name: 'video',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    refreshVideos: (state, action: PayloadAction<VideoUpdatePayload>) => {
      // console.log('refreshVideos action: ', action)
      const payload = action.payload;
      
      if (state.ready && payload) {
        const { addrUpdateCount, addr2UpdateCount, vdata } = payload;
        const nextList = state.list.slice();
        const nextList2 = state.list2.slice();
        const mapListIndex:any = {};
        const mapListIndex2:any = {};
        vdata.forEach((e:any) => {
          if(e.src === 1) {
            const listIndex = state.mapListIndex[e.id]
            if (listIndex >= 0) {
              nextList[listIndex] = {
                ...nextList[listIndex],
                minute: e['minute_flexible'],
                minuteLast: e['minute_last'],
                ontime: e.ontime,
                status: e.flag as vStatus,
                wrongs: e.wrongs,
                warning: e.warning,
                parsedDigits: e['parsed_digits'],
                timestamp: new Date(e['last_timestamp']).getTime(),
              }
            }
          }
          else {
            const listIndex = state.mapListIndex2[e.id]
            if (listIndex >= 0) {
              nextList2[listIndex] = {
                ...nextList2[listIndex],
                minute: e['minute_flexible'],
                minuteLast: e['minute_last'],
                ontime: e.ontime,
                status: e.flag as vStatus,
                wrongs: e.wrongs,
                warning: e.warning,
                parsedDigits: e['parsed_digits'],
                timestamp: new Date(e['last_timestamp']).getTime(),
              }
            }
          }
        })
        if(addrUpdateCount > 0) {
          nextList.sort(sortVideoArray);
          nextList.forEach((e: any, idx: number) => {
            mapListIndex[e.id] = idx
          })
          state.mapListIndex = mapListIndex
          state.list = nextList;
        }
        if(addr2UpdateCount > 0) {
          nextList2.sort(sortVideoArray);
          nextList2.forEach((e: any, idx: number) => {
            mapListIndex2[e.id] = idx
          })
          state.mapListIndex2 = mapListIndex2
          state.list2 = nextList2;
        }
      }
      
      // state.list = action.payload.slice();
    },
    
    // buildVideoConstruct: (state, action: PayloadAction<VideoState[]>) => {
    buildVideoConstruct: (state, action: PayloadAction<VideoInfoPayload>) => {
      console.log('buildVideoConstruct action: ', action)
      const { addrVideos, addr2Videos } = action.payload;
      const mapListIndex:any = {}
      const nextList = addrVideos.map((e: any) => {
        const resVs:VideoState = {
          id: e.id,
          status: e.flag === vStatus.OPEN ? vStatus.LOADING : e.flag,
          img: hostAddress ? 'http://' + hostAddress + e.img : e.img,
          src: e.src,
          ontime: true,
          minute: -1,
          minuteLast: -1,
          wrongs: e.wrongs,
          warning: e.warning,
          parsedDigits: [],
          timestamp: new Date().getTime(),
        }
        return resVs
      })
      nextList.sort(sortVideoArray)
      nextList.forEach((e: any, idx: number) => {
        mapListIndex[e.id] = idx
      })
      const mapListIndex2:any = {}
      const nextList2 = addr2Videos.map((e: any) => {
        const resVs:VideoState = {
          id: e.id,
          status: e.flag === vStatus.OPEN ? vStatus.LOADING : e.flag,
          src: e.src,
          img: hostAddress ? 'http://' + hostAddress + e.img : e.img,
          ontime: true,
          minute: -1,
          minuteLast: -1,
          wrongs: e.wrongs,
          warning: e.warning,
          parsedDigits: [],
          timestamp: new Date().getTime(),
        }
        return resVs
      })
      nextList2.sort(sortVideoArray)
      nextList2.forEach((e: any, idx: number) => {
        mapListIndex2[e.id] = idx
      })
      state.list = nextList
      state.mapListIndex = mapListIndex
      state.list2 = nextList2
      state.mapListIndex2 = mapListIndex2
      state.ready = true
    },
    beforeReloadVideo: (state) => {
      state.list = [];
      state.list2= [];
      state.mapListIndex = {};
      state.mapListIndex2 = {};
      state.ready = false;
    },
    switchVideosToShow: (state) => {
      const ori_source = state.listToShow;
      console.log('switchVideosToShow source before switch: ', ori_source)
      state.listToShow = ori_source === 1 ? 2 : 1;
      console.log('switchVideosToShow source after switch: ', state.listToShow)
    }
  },
  
});

export const { refreshVideos, buildVideoConstruct, beforeReloadVideo, switchVideosToShow } = videoSlice.actions;

// export const videos = (state: RootState) => state.video.list;
// export const videos2 = (state: RootState) => state.video.list2;
export const videos = (state: RootState) => state.video.listToShow === 1 ? state.video.list: state.video.list2;
export const videosReady = (state: RootState) => state.video.ready;
export const videoBasicInfo = (state: RootState) => state.video;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const selectCount = (state: RootState) => state.videos.value;


export default videoSlice.reducer;
