import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-page-error',
    templateUrl: './page-error.component.html',
    styleUrls: ['./page-error.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageErrorComponent implements OnInit {
    constructor(
        private activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef) {}

    code = 0;
    codeToMessage = {
        404: 'Похоже, ссылка на эту игру уже устарела. Но всегда можно начать новую!',
        500: 'Что-то пошло не так...'
    };

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(value => {
            this.code = Number(value.get('code')) || 500;
            this.cd.markForCheck();
        });
    }

}
