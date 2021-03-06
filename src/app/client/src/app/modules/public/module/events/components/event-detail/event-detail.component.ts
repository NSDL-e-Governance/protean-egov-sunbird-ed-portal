
import { Component, OnInit } from '@angular/core';
import { LibEventService, EventDetailService, EventService } from 'ngtek-event-library';

import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import { FrameworkService, UserService } from '@sunbird/core';
import {ToasterService, LayoutService, COLUMN_TYPE}from '@sunbird/shared';
import { map, tap, switchMap, skipWhile, takeUntil, catchError, startWith } from 'rxjs/operators';
import { forkJoin, Subject, Observable, BehaviorSubject, merge, of, concat, combineLatest } from 'rxjs';
// import{ attendanceList } from './attendance';
@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  eventItem: any;
  eventList: any;
  eventCreatorInformation: any;

  userId: any;
  eventConfig: any;
  queryParams : any;
  eventDetailItem: any;
  libEventConfig: any;
  layoutConfiguration: any;
  FIRST_PANEL_LAYOUT;
  SECOND_PANEL_LAYOUT;
  batchId: any;
  attendeeList: any;
  // attendeeList: any = attendanceList;
  public subscription$;
  public unsubscribe = new Subject<void>();

  constructor(private eventDetailService: EventDetailService ,
    private activatedRoute : ActivatedRoute,
    private eventService: EventService ,
    public userService: UserService,
    public frameworkService:FrameworkService,
    public layoutService: LayoutService,
    public router: Router
   ) { }

  async showEventDetailPage(identifier) {
    await this.getAttendeeList();
    this.eventDetailService.getEvent(identifier).subscribe((data: any) => {
      this.eventItem = data.result.event;
      this.userService.getUserData(this.eventItem.owner).subscribe(data => {
        this.eventCreatorInformation = data.result.response;
      });
    },
      (err: any) => {
        console.log('err = ', err);
      });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.queryParams = params;
    this.showEventDetailPage(params.identifier);
    this.userId=this.userService.userid;
     this.setEventConfig();
     this.initConfiguration();
     this.getBatch(params.identifier);
     
  });
}
setEventConfig() {
  this.libEventConfig = {
    context: {
      user:this.userService.userProfile,
      identifier: '',
      channel: this.userService.channel,
      authToken: '',
      sid: this.userService.sessionId,
      uid: this.userService.userid,
      additionalCategories: 'additionalCategories',
    },
    config: {
      mode: 'list'
    }
  };
}

private initConfiguration() {
  this.layoutConfiguration = this.layoutService.initlayoutConfig();
  this.redoLayout();
  this.layoutService.switchableLayout().
      pipe(takeUntil(this.unsubscribe)).subscribe(layoutConfig => {
        if (layoutConfig != null) {
          this.layoutConfiguration = layoutConfig.layout;
        }
        this.redoLayout();
      });
}

redoLayout() {
  this.FIRST_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(0, this.layoutConfiguration, COLUMN_TYPE.threeToNine, true);
  this.SECOND_PANEL_LAYOUT = this.layoutService.redoLayoutCSS(1, this.layoutConfiguration, COLUMN_TYPE.threeToNine, true);
}
getBatch(identifier){
  let filters ={
    "courseId": identifier,
    "enrollmentType": "open"
    };
    this.eventService.getBatches(filters).subscribe((res) => {
      this.batchId = res.result.response.content[0].identifier;
      console.log("Batch Id -", this.batchId);
    });
}
 getAttendeeList(){
  this.eventService.getAttendanceList(this.queryParams.identifier,this.queryParams.batchid).subscribe((data) => {
    this.attendeeList = data.result.content;

    // this.getEnrollEventUsersData(this.attendeeList);
    console.log("this.attendeeList-------",this.attendeeList);
  }, (err) => {
    console.log("this.attendeeList-------",this.attendeeList);
    this.attendeeList = [];
  });
}
navToDashbord(identifier){

  this.router.navigate(['/explore-events/report'],
  { queryParams:  {  identifier: identifier,
        batchid: this.batchId } });
 }

navigateToEventPage() {
  this.router.navigate(['/explore-events/published']);
}
navToEventDetail($event)
  { console.log("In src/event detail");
  this.router.navigate(['/explore-events/detail'],
    {
      queryParams: {
        identifier: $event.identifier
      }
    });

    setTimeout(function(){window.location.reload();
    }, 2000);
  }
}

