import { observable, action, computed, reaction } from "mobx";
import * as api from "./api";

class RootStore {
  @observable day = 0
  @observable weatherParams = []
  @observable currentWeatherParam = null
  @observable weatherFeatures = []
  @observable currentPolygon = null

  @observable photoSpotsParams = []
  @observable currentPhotoSpotsParam = null
  @observable photoSpotsFeatures = []
  @observable photoSpotsPolygon = null


  constructor() {
    this.init()
    const reactOnWeatherParam = reaction(
      () => [this.day, this.currentWeatherParam],
      async ([day, param]) => {
        const res = await api.getWeatherFeatures(day, undefined, param);
        this.weatherFeatures = res.data.features
      }
    )

    const reactOnPhotoSpotParam = reaction(
      () => [this.day, this.currentPhotoSpotsParam],
      async ([day, param]) => {
        const res = await api.getPhotoSpotsFeatures(day, param);
        this.photoSpotsFeatures = res.data.features
      }
    )
  }

  @action
  async init() {
    await this.getPhotoSpotsParams()
    this.currentPhotoSpotsParam = this.photoSpotsParams[0].id

    await this.getWeatherParams();
    this.currentWeatherParam = this.weatherParams[0].id
  }

  @action
  selectWeatherPolygon(data) {
    this.currentPolygon = data;
  }

  @action
  selectPhotoSpotPolygon(data) {
    this.photoSpotsPolygon = data;
  }

  @action
  async getWeatherParams() {
    const res = await api.getWeatherParams()
    this.weatherParams = res.data.params
  }

  @action
  async getPhotoSpotsParams() {
    const res = await api.getPhotoSpotsParams()
    this.photoSpotsParams = res.data.params
  }

  @computed
  get weatherParamsList() {
    return this.weatherParams.map(el => ({
      label: el.name,
      value: el.id
    }))
  }

  @computed
  get photoSpotsList() {
    return this.photoSpotsParams.map(el => ({
      label: el.name,
      value: el.id
    }))
  }
}

export default new RootStore();
