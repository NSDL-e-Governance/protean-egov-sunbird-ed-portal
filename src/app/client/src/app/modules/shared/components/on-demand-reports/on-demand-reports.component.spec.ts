import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ToasterService, ResourceService, ConfigService} from '../../services';
import {OnDemandReportService} from '../../services/on-demand-report/on-demand-report.service';
import {SuiModule} from 'ng2-semantic-ui';
import {FormsModule} from '@angular/forms';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {SbDatatableComponent} from '../sb-datatable/sb-datatable.component';
import {OnDemandReportsComponent} from './on-demand-reports.component';
import {throwError, of} from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MockData} from './on-demand-report.component.spec.data';
import { ReactiveFormsModule } from '@angular/forms';

describe('OnDemandReportsComponent', () => {
  const resourceBundle = {
    'messages': {
      'fmsg': {m0004: 'm0004'},
      'stmsg': {},
      'smsg': {}
    },
    frmelmnts: {lbl: {requestFailed: 'requestFailed'}}
  };
  let component: OnDemandReportsComponent;
  let fixture: ComponentFixture<OnDemandReportsComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OnDemandReportsComponent, SbDatatableComponent],
      imports: [SuiModule, FormsModule, NgxDatatableModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [ToasterService, OnDemandReportService, HttpClient, ConfigService,
        {provide: ResourceService, useValue: resourceBundle}
      ]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(OnDemandReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should set data on report change', () => {
    component.reportChanged(MockData.data);
    expect(component.selectedReport).toEqual(MockData.data);
  });
  it('should load report', () => {
    component.tag = 'mockTag';
    component.batch = {
      batchId: 'batchId'
    };
    const onDemandReportService = TestBed.get(OnDemandReportService);
    spyOn(onDemandReportService, 'getReportList').and.returnValue(of(MockData.reportListResponse));
    component.loadReports();
    expect(component.onDemandReportData).toEqual(MockData.reportListResponse.result.jobs);
  });
  it('should throw error if not load report', () => {
    component.tag = 'mockTag';
    component.batch = {
      batchId: 'batchId'
    };
    const onDemandReportService = TestBed.get(OnDemandReportService);
    const toasterService = TestBed.get(ToasterService);
    spyOn(onDemandReportService, 'getReportList').and.returnValue(throwError({}));
    spyOn(toasterService, 'error').and.callThrough();
    component.loadReports();
    expect(toasterService.error).toHaveBeenCalledWith(resourceBundle.messages.fmsg.m0004);
  });
  it('should throw error if not onDownloadLinkFail', () => {
    component.tag = 'mockTag';
    const onDemandReportService = TestBed.get(OnDemandReportService);
    const toasterService = TestBed.get(ToasterService);
    spyOn(onDemandReportService, 'getReport').and.returnValue(throwError({}));
    spyOn(toasterService, 'error').and.callThrough();
    component.onDownloadLinkFail({tag: 'mockTag', requestId: 'mockId'});
    expect(toasterService.error).toHaveBeenCalledWith(resourceBundle.messages.fmsg.m0004);
  });
  it('should not throw error on onDownloadLinkFail', () => {
    component.tag = 'mockTag';
    const onDemandReportService = TestBed.get(OnDemandReportService);
    const toasterService = TestBed.get(ToasterService);
    spyOn(onDemandReportService, 'getReport').and.returnValue(of({}));
    spyOn(toasterService, 'error').and.callThrough();
    component.onDownloadLinkFail({tag: 'mockTag', requestId: 'mockId'});
    expect(toasterService.error).toHaveBeenCalledWith(resourceBundle.messages.fmsg.m0004);
  });
  it('should throw error if not submitRequest', () => {
    component.tag = 'mockTag';
    component.batch = {
      batchId: 'batchId'
    };
    component.onDemandReportData = MockData.reportListResponse.result.jobs;
    component.userId = 'userId';
    component.selectedReport = {jobId: 'jobId'};
    const onDemandReportService = TestBed.get(OnDemandReportService);
    const toasterService = TestBed.get(ToasterService);
    spyOn(onDemandReportService, 'submitRequest').and.returnValue(throwError({}));
    spyOn(toasterService, 'error').and.callThrough();
    component.submitRequest();
    expect(toasterService.error).toHaveBeenCalledWith(resourceBundle.frmelmnts.lbl.requestFailed);
  });
  it('should populate data as submit request succeess', () => {
    component.tag = 'mockTag';
    component.batch = {
      batchId: 'batchId'
    };
    component.userId = 'userId';
    component.selectedReport = {jobId: 'jobId'};
    component.onDemandReportData = [{1: 'a'}];
    const onDemandReportService = TestBed.get(OnDemandReportService);
    const toasterService = TestBed.get(ToasterService);
    spyOn(onDemandReportService, 'submitRequest').and.returnValue(of({result: {2: 'b'}}));
    spyOn(toasterService, 'error').and.callThrough();
    component.submitRequest();
    expect(component.onDemandReportData).toEqual([{2: 'b'}, {1: 'a'}]);
  });

  it('should call checkStatus', () => {
    component.selectedReport = OnDemandReports.selectedReport;
    OnDemandReports.responseData.result.jobs[0]['status'] = 'COMPLETED';
    component.onDemandReportData = OnDemandReports.responseData.result.jobs;
    component.batch = {endDate: "2020-10-25"};
    const result = component.checkStatus();
    expect(result).toBeFalsy();
  });

  it('should call checkStatus', () => {
    component.selectedReport = OnDemandReports.selectedReport;
    OnDemandReports.responseData.result.jobs[0]['status'] = 'SUBMITTED';
    component.onDemandReportData = OnDemandReports.responseData.result.jobs;
    component.batch = {endDate: null};
    const result = component.checkStatus();
    expect(result).toBeFalsy();
  });

  it('should call dataModification', () => {
    const row = {dataser: 'progress-exhaust'};
    const result = component.dataModification(row);
    expect(result.dataset).toBe('Course progress exhaust');
  });
  it('should call dataModification', () => {
    const row = {dataser: 'userinfo-exhaust'};
    const result = component.dataModification(row);
    expect(result.dataset).toBe('User profile exhaust');
  });
  it('should call dataModification', () => {
    const row = {dataser: 'response-exhaust'};
    const result = component.dataModification(row);
    expect(result.dataset).toBe('Question set report');
  });

});
